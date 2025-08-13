import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Copy, 
  Download,
  Code,
  FileText,
  Eye,
  RefreshCw,
 
  Zap
} from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useAppStore } from '../context/useAppStore';
import apiService from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface GeneratedTest {
  fileName: string;
  content: string;
  framework: string;
  sourceFile: string;
  testSummary: {
    id: string;
    title: string;
    description: string;
    type: string;
    file?: string;
    priority?: string;
    complexity?: string;
    createdAt?: string;
  };
  generatedAt: string;
}

const TestCodeView: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    selectedRepository,
    selectedSummaries,
    generatedTests,
    setGeneratedTests,
    setCurrentStep
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTest, setSelectedTest] = useState<GeneratedTest | null>(null);
  const [selectedFramework, _setSelectedFramework] = useState('jest');

  useEffect(() => {
    console.log('=== TEST CODE VIEW TRIGGER CHECK ===');
    console.log('selectedSummaries.length:', selectedSummaries.length);
    console.log('generatedTests.length:', generatedTests.length);
    console.log('user?.accessToken exists:', !!user?.accessToken);
    console.log('selectedRepository exists:', !!selectedRepository);
    console.log('selectedSummaries:', selectedSummaries);
    
    if (selectedSummaries.length > 0 && generatedTests.length === 0) {
      console.log('✅ CONDITIONS MET - Triggering automatic test generation');
      generateTestCode();
    } else {
      console.log('❌ CONDITIONS NOT MET for auto test generation:');
      console.log('- Has summaries:', selectedSummaries.length > 0);
      console.log('- No existing tests:', generatedTests.length === 0);
    }
  }, [selectedSummaries]);

  const generateTestCode = async () => {
    console.log('=== STARTING TEST CODE GENERATION ===');
    console.log('Validation checks:');
    console.log('- user?.accessToken:', !!user?.accessToken);
    console.log('- selectedRepository:', !!selectedRepository);
    console.log('- selectedSummaries.length:', selectedSummaries.length);
    console.log('- selectedFramework:', selectedFramework);
    
    if (!user?.accessToken || !selectedRepository || selectedSummaries.length === 0) {
      console.log('❌ VALIDATION FAILED - Missing required data');
      console.log('Missing:', {
        accessToken: !user?.accessToken,
        repository: !selectedRepository,
        summaries: selectedSummaries.length === 0
      });
      toast.error('Missing required data for test code generation');
      return;
    }

          console.log('✅ VALIDATION PASSED - Starting generation...');
      setIsGenerating(true);
      try {
        console.log('🚀 CALLING API with parameters:');
        console.log('- accessToken length:', user.accessToken.length);
        console.log('- selectedSummaries:', selectedSummaries);
        console.log('- owner:', selectedRepository.owner.login);
        console.log('- repo:', selectedRepository.name);
        console.log('- framework:', selectedFramework);
        
        const response = await apiService.generateMultipleTests(
          user.accessToken,
          selectedSummaries,
          selectedRepository.owner.login,
          selectedRepository.name,
          selectedFramework
        );

        console.log('✅ API RESPONSE RECEIVED:');
        console.log('📦 Backend response for generateMultipleTests:', response);
        console.log('- response.results length:', response.results?.length);
        console.log('- response.errors length:', response.errors?.length);
        console.log('- First result sample:', response.results?.[0]);

      // Transform the backend response to match our frontend interface
      const transformedTests = response.results
        .filter(result => result.success)
        .map((result, index) => {
          console.log(`Transforming result ${index}:`, result);
          
          return {
            fileName: result.testCode?.fileName || `test-${index + 1}.js`,
            content: result.testCode?.content || '// Test content not available',
            framework: result.testCode?.framework || 'jest',
            sourceFile: result.testCode?.sourceFile || result.summary?.file,
            testSummary: {
              id: result.summary?.id || `test-${index + 1}`,
              title: result.summary?.title || 'Generated Test',
              description: result.summary?.description || 'AI-generated test case',
              type: result.summary?.type || 'unit',
              file: result.summary?.file || result.testCode?.sourceFile,
              priority: result.summary?.priority || 'medium',
              complexity: result.summary?.complexity || 'medium',
              framework: result.testCode?.framework || 'jest',
              createdAt: result.summary?.createdAt || new Date().toISOString()
            },
            generatedAt: new Date().toISOString()
          };
        });

      console.log('Transformed tests:', transformedTests);

      setGeneratedTests(transformedTests);
      toast.success(`Generated ${transformedTests.length} test files!`);
      
      if (response.errors.length > 0) {
        toast.error(`${response.errors.length} test(s) failed to generate`);
      }
    } catch (error: any) {
      console.error('❌ Test code generation failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to generate test code. Please try again.';
      
      if (error?.response?.status === 401) {
        errorMessage = 'Authentication expired. Please sign in again.';
      } else if (error?.response?.status === 403) {
        errorMessage = 'Insufficient permissions. Please check repository access.';
      } else if (error?.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Server error. Our AI service might be temporarily unavailable.';
      } else if (error?.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      
      // Reset to previous step if it's a critical error
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('🔄 Critical error - redirecting to summaries step');
        setCurrentStep('summaries');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Code copied to clipboard!');
  };

  const handleDownloadTest = (test: GeneratedTest) => {
    const blob = new Blob([test.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = test.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${test.fileName}`);
  };

  const handleNext = () => {
    if (generatedTests.length === 0) {
      toast.error('No test code generated yet');
      return;
    }
    setCurrentStep('review');
    toast.success(`Ready to create pull request with ${generatedTests.length} test files`);
  };

  const handleBack = () => {
    setCurrentStep('summaries');
  };

  const handleRegenerateAll = () => {
    setGeneratedTests([]);
    generateTestCode();
  };

  const formatFileSize = (content: string) => {
    const bytes = new Blob([content]).size;
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Generated Test Code
          </h2>
          <p className="text-gray-600">
            Review and customize the generated test code for {selectedSummaries.length} test summaries.
          </p>
        </div>
        {generatedTests.length > 0 && (
          <button
            onClick={handleRegenerateAll}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate All
          </button>
        )}
      </div>

      {isGenerating && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Generating test code with AI...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )}

      {!isGenerating && generatedTests.length === 0 && (
        <div className="text-center py-12">
          <Code className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No test code generated</h3>
          <p className="text-gray-600 mb-4">Click the button below to generate test code.</p>
          <button
            onClick={generateTestCode}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate Test Code
          </button>
        </div>
      )}

      {!isGenerating && generatedTests.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Files List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Generated Test Files ({generatedTests.length})
              </h3>
              <div className="space-y-3">
                {generatedTests.map((test, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTest === test
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FileText className="w-4 h-4 text-gray-500 mr-2" />
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {test.fileName}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {test.testSummary?.title || 'Test case'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {test.framework}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(test.content)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(test.content);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadTest(test);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Code Preview
              </h3>
              {selectedTest ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Code className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {selectedTest.fileName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {selectedTest.framework}
                        </span>
                        <button
                          onClick={() => handleCopyCode(selectedTest.content)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-4 overflow-auto max-h-96">
                    <pre className="text-sm">
                      <code>{selectedTest.content}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Eye className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">Select a test file to preview its code</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Summaries
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue to Review
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TestCodeView; 