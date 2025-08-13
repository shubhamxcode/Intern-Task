import axios from 'axios';
import config from '../config/app.js';
import { AppError } from '../middlewares/errorHandler.js';

class AIService {
  constructor() {
    this.openaiApiKey = config.ai.openai.apiKey;
    this.geminiApiKey = config.ai.gemini.apiKey;
    this.preferredProvider = this.openaiApiKey ? 'openai' : 'gemini';
  }

  /**
   * Generate test case summaries for given code files
   */
  async generateTestCaseSummaries(files) {
    try {
      // Prepare the prompt with file contents
      const fileContents = files.map(file => 
        `File: ${file.path}\n\`\`\`${this.getFileExtension(file.path)}\n${file.content}\n\`\`\``
      ).join('\n\n');

      const prompt = `
You are a senior test engineer. Analyze the following code files and generate a comprehensive list of test case summaries.

For each file, identify:
1. Unit test cases for individual functions/methods
2. Integration test cases for component interactions
3. Edge cases and error handling scenarios
4. Performance test considerations (if applicable)

${fileContents}

Please provide your response as a JSON array of test case summaries. Each summary should have:
- id: unique identifier
- title: brief descriptive title
- description: detailed description of what the test should verify
- type: "unit", "integration", "e2e", or "performance"
- file: the source file this test relates to
- priority: "high", "medium", or "low"
- complexity: "simple", "medium", or "complex"

Example format:
[
  {
    "id": "test-1",
    "title": "Should validate user input",
    "description": "Test that the validateUser function correctly validates required fields and returns appropriate error messages for invalid inputs",
    "type": "unit",
    "file": "src/utils/validation.js",
    "priority": "high",
    "complexity": "simple"
  }
]

Generate 5-10 meaningful test case summaries covering the most important functionality.
`;

      const response = await this.callAI(prompt);
      return this.parseTestCaseSummaries(response);
    } catch (error) {
      throw new AppError('Failed to generate test case summaries', 500);
    }
  }

  /**
   * Generate actual test code for a specific test case
   */
  async generateTestCode(testSummary, fileContent, framework = 'jest') {
    try {
      const prompt = `
You are a senior test engineer. Generate complete, runnable test code based on the following specification:

Test Case: ${testSummary.title}
Description: ${testSummary.description}
Type: ${testSummary.type}
Target File: ${testSummary.file}
Framework: ${framework}

Source Code:
\`\`\`${this.getFileExtension(testSummary.file)}
${fileContent}
\`\`\`

Requirements:
1. Generate complete, runnable test code using ${framework}
2. Include necessary imports and setup
3. Cover positive, negative, and edge cases
4. Follow best practices for ${framework}
5. Add descriptive test names and comments
6. Include mock data where appropriate
7. Test error handling scenarios

For JavaScript/TypeScript files, use Jest/Vitest syntax.
For Python files, use pytest.
For Java files, use JUnit 5.
For other languages, use the most appropriate testing framework.

Provide the complete test file content with proper file naming convention.
`;

      const response = await this.callAI(prompt);
      return this.formatTestCode(response, testSummary, framework);
    } catch (error) {
      throw new AppError('Failed to generate test code', 500);
    }
  }

  /**
   * Call the appropriate AI service
   */
  async callAI(prompt) {
    if (this.preferredProvider === 'openai' && this.openaiApiKey) {
      return await this.callOpenAI(prompt);
    } else if (this.geminiApiKey) {
      return await this.callGemini(prompt);
    } else {
      throw new AppError('No AI service configured', 500);
    }
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a senior test engineer with expertise in various testing frameworks and best practices.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new AppError('Invalid OpenAI API key', 401);
      }
      if (error.response?.status === 429) {
        throw new AppError('OpenAI API rate limit exceeded', 429);
      }
      throw new AppError('OpenAI API request failed', 500);
    }
  }

  /**
   * Call Google Gemini API
   */
  async callGemini(prompt) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4000
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new AppError('Invalid Gemini API key', 401);
      }
      if (error.response?.status === 429) {
        throw new AppError('Gemini API rate limit exceeded', 429);
      }
      throw new AppError('Gemini API request failed', 500);
    }
  }

  /**
   * Parse test case summaries from AI response
   */
  parseTestCaseSummaries(response) {
    try {
      // Extract JSON from response (in case AI adds extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const summaries = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize summaries
      return summaries.map((summary, index) => ({
        id: summary.id || `test-${index + 1}`,
        title: summary.title || 'Untitled Test',
        description: summary.description || 'No description provided',
        type: summary.type || 'unit',
        file: summary.file || 'unknown',
        priority: summary.priority || 'medium',
        complexity: summary.complexity || 'medium'
      }));
    } catch (error) {
      throw new AppError('Failed to parse test case summaries', 500);
    }
  }

  /**
   * Format test code response
   */
  formatTestCode(response, testSummary, framework) {
    // Extract code block if present
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    const code = codeMatch ? codeMatch[1] : response;

    // Generate filename based on test case and framework
    const originalFile = testSummary.file;
    const extension = this.getFileExtension(originalFile);
    const baseName = originalFile.split('/').pop().replace(/\.[^/.]+$/, '');
    
    let testFileName;
    if (framework === 'jest' || framework === 'vitest') {
      testFileName = `${baseName}.test${extension}`;
    } else if (framework === 'pytest') {
      testFileName = `test_${baseName}.py`;
    } else if (framework === 'junit') {
      testFileName = `${baseName}Test.java`;
    } else {
      testFileName = `${baseName}_test${extension}`;
    }

    return {
      fileName: testFileName,
      content: code.trim(),
      framework,
      testSummary
    };
  }

  /**
   * Get file extension from file path
   */
  getFileExtension(filePath) {
    const extension = filePath.substring(filePath.lastIndexOf('.'));
    return extension || '';
  }

  /**
   * Detect appropriate testing framework based on file type
   */
  detectTestingFramework(filePath, projectType = null) {
    const extension = this.getFileExtension(filePath).toLowerCase();
    
    switch (extension) {
      case '.js':
      case '.jsx':
      case '.ts':
      case '.tsx':
        return projectType === 'react' ? 'jest' : 'vitest';
      case '.py':
        return 'pytest';
      case '.java':
        return 'junit';
      case '.cs':
        return 'xunit';
      case '.go':
        return 'testing';
      case '.php':
        return 'phpunit';
      case '.rb':
        return 'rspec';
      default:
        return 'jest'; // default fallback
    }
  }
}

export default new AIService(); 