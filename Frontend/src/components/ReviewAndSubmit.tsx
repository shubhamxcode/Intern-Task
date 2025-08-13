import React, { useState } from 'react';
import { 
  ArrowLeft, 
  GitPullRequest,
  FileText,

  CheckCircle,
  AlertCircle,
  ExternalLink,
  
} from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useAppStore } from '../context/useAppStore';
import apiService from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const ReviewAndSubmit: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    selectedRepository,
    selectedFiles,
    testSummaries,
    generatedTests,
    selectedSummaries,
    setCurrentStep,
    reset
  } = useAppStore();

  const [isCreatingPR, setIsCreatingPR] = useState(false);
  const [prTitle, setPrTitle] = useState(`Add AI-generated test cases for ${selectedRepository?.name || 'repository'}`);
  // Generate initial PR description with safety checks
  const generateInitialDescription = () => {
    console.log('=== PR DESCRIPTION DEBUG ===');
    console.log('selectedFiles:', selectedFiles);
    console.log('generatedTests:', generatedTests);
    console.log('testSummaries:', testSummaries);
    console.log('Sample generatedTest:', generatedTests[0]);
    
    if (generatedTests.length === 0) {
      return `## 🤖 AI-Generated Test Cases

This pull request will add comprehensive test cases generated using AI.

### 📊 Test Summary
- Test files will be generated after selection
- Please complete the test generation process first

Generated with ❤️ by TestCraft AI`;
    }

    const frameworks = [...new Set(generatedTests.map(t => t.framework).filter(Boolean))];
    console.log('Detected frameworks:', frameworks);
    
    const testsList = generatedTests.map((test, index) => {
      console.log(`Processing test ${index}:`, {
        fileName: test.fileName,
        testSummary: test.testSummary,
        hasTitle: !!test.testSummary?.title,
        hasDescription: !!test.testSummary?.description
      });
      
      const fileName = test.fileName || `test-file-${index + 1}.js`;
      const title = test.testSummary?.title || test.testSummary?.description || `Test case for ${fileName}`;
      return `- \`${fileName}\` - ${title}`;
    }).join('\n');
    
    console.log('Generated tests list:', testsList);

    return `## 🤖 AI-Generated Test Cases

This pull request adds comprehensive test cases generated using AI for the following files:

${selectedFiles.map(file => `- \`${file.path}\``).join('\n')}

### 📊 Test Summary
- **${generatedTests.length}** test files generated
- **${testSummaries.length}** test scenarios covered
- **Frameworks**: ${frameworks.length > 0 ? frameworks.join(', ') : 'Jest (default)'}

### 🔍 What's Included
${testsList}

### ✅ Benefits
- Improved code coverage
- Automated testing for core functionality
- Consistent test patterns and best practices
- Ready-to-run test suites

Generated with ❤️ by TestCraft AI`;
  };

  const [prDescription, setPrDescription] = useState(generateInitialDescription());
  const [createdPR, setCreatedPR] = useState<any>(null);

  // Update description when generatedTests changes
  React.useEffect(() => {
    if (generatedTests.length > 0) {
      setPrDescription(generateInitialDescription());
    }
  }, [generatedTests, selectedFiles, testSummaries]);

  // DEBUG: Let's log everything to understand what data we have
  React.useEffect(() => {
    console.log('=== REVIEW AND SUBMIT DEBUG ===');
    console.log('Full store state:');
    console.log('- selectedRepository:', selectedRepository);
    console.log('- selectedFiles:', selectedFiles);
    console.log('- testSummaries:', testSummaries);
    console.log('- generatedTests:', generatedTests);
    console.log('- selectedSummaries:', selectedSummaries);
    
    if (generatedTests.length > 0) {
      console.log('First generated test detailed:');
      const firstTest = generatedTests[0];
      console.log('- fileName:', firstTest.fileName);
      console.log('- framework:', firstTest.framework);
      console.log('- testSummary:', firstTest.testSummary);
      console.log('- testSummary.title:', firstTest.testSummary?.title);
      console.log('- testSummary.description:', firstTest.testSummary?.description);
      console.log('- content length:', firstTest.content?.length);
    }
  }, [selectedRepository, selectedFiles, testSummaries, generatedTests, selectedSummaries]);

  const handleCreatePR = async () => {
    if (!user?.accessToken || !selectedRepository || generatedTests.length === 0) {
      toast.error('Missing required data for PR creation');
      return;
    }

    setIsCreatingPR(true);
    try {
      const testFiles = generatedTests.map(test => ({
        fileName: test.fileName,
        content: test.content
      }));

      const response = await apiService.createTestPullRequest(
        user.accessToken,
        testFiles,
        selectedRepository.owner.login,
        selectedRepository.name,
        prTitle,
        prDescription
      );

      setCreatedPR(response.pullRequest);
      
      // Enhanced success message with details
      toast.success(
        `🎉 Pull Request #${response.pullRequest.number} created successfully!\n` +
        `📂 ${generatedTests.length} test file${generatedTests.length !== 1 ? 's' : ''} added\n` +
        `🔗 Click "View Pull Request" to review on GitHub`,
        {
          duration: 6000,
          style: {
            maxWidth: '400px',
            fontSize: '14px',
            lineHeight: '1.4'
          }
        }
      );
    } catch (error: any) {
      console.error('❌ Pull request creation failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create pull request. Please try again.';
      
      if (error?.response?.status === 401) {
        errorMessage = 'Authentication expired. Please sign in again.';
      } else if (error?.response?.status === 403) {
        errorMessage = 'Insufficient permissions to create pull request in this repository.';
      } else if (error?.response?.status === 422) {
        errorMessage = 'Invalid request. The repository might be archived or branch already exists.';
      } else if (error?.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Server error. GitHub API might be temporarily unavailable.';
      } else if (error?.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      
      // Reset to previous step if it's a critical error
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('🔄 Critical error - redirecting to tests step');
        setCurrentStep('tests');
      }
    } finally {
      setIsCreatingPR(false);
    }
  };

  const handleBack = () => {
    setCurrentStep('tests');
  };

  const handleStartOver = () => {
    reset();
    setCurrentStep('repositories');
    toast.success('Started over. Select a new repository to begin.');
  };

  const formatFileSize = (content: string) => {
    const bytes = new Blob([content]).size;
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const totalLinesOfCode = generatedTests.reduce((total, test) => {
    return total + (test.content ? test.content.split('\n').length : 0);
  }, 0);

  if (createdPR) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Pull Request Created Successfully!
          </h2>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
            Your AI-generated test cases have been successfully added to a new pull request. 
            You can now review, modify, or merge the changes on GitHub.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="text-green-700">
                <span className="font-semibold">📊 {generatedTests.length}</span> test file{generatedTests.length !== 1 ? 's' : ''} created
              </div>
              <div className="text-green-700">
                <span className="font-semibold">📝 {totalLinesOfCode}</span> lines of code added
              </div>
              <div className="text-green-700">
                <span className="font-semibold">🚀 PR #{createdPR.number}</span> ready for review
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto mb-8">
            <div className="flex items-center mb-4">
              <GitPullRequest className="w-6 h-6 text-purple-600 mr-3" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  {createdPR.title}
                </h3>
                <p className="text-sm text-gray-600">
                  #{createdPR.number} • {createdPR.state}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">Repository:</span>
                <p>{selectedRepository?.fullName}</p>
              </div>
              <div>
                <span className="font-medium">Branch:</span>
                <p>{createdPR.head?.ref || 'test-cases'}</p>
              </div>
            </div>


          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleStartOver}
              className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safety check for empty or undefined generatedTests
  if (!generatedTests || generatedTests.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Test Cases to Review
          </h2>
          <p className="text-gray-600 mb-6">
            It looks like no test cases have been generated yet.
          </p>
          <button
            onClick={() => setCurrentStep('tests')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Test Generation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Review & Submit
          </h2>
          <p className="text-gray-600">
            Review your generated test cases and create a pull request to add them to your repository.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Summary Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Summary
          </h3>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Repository:</span>
                <p className="text-gray-900">{selectedRepository?.fullName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Source Files:</span>
                <p className="text-gray-900">{selectedFiles.length} files</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Test Files:</span>
                <p className="text-gray-900">{generatedTests.length} files</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Lines:</span>
                <p className="text-gray-900">{totalLinesOfCode.toLocaleString()} lines</p>
              </div>
            </div>
          </div>

          {/* Generated Test Files */}
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Generated Test Files ({generatedTests.length})
          </h4>
          <div className="space-y-3 mb-6">
                         {generatedTests.map((test, index) => (
               <div key={index} className="border border-gray-200 rounded-lg p-4">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center">
                     <FileText className="w-4 h-4 text-blue-500 mr-3" />
                     <div>
                       <h5 className="text-sm font-medium text-gray-900">
                         {test.fileName || `test-${index + 1}.js`}
                       </h5>
                       <p className="text-xs text-gray-600">
                         {test.testSummary?.title || test.testSummary?.description || 'Test case'}
                       </p>
                     </div>
                   </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {test.framework}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(test.content)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pull Request Configuration */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pull Request Details
          </h3>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="pr-title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="pr-title"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter pull request title"
              />
            </div>

            <div>
              <label htmlFor="pr-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="pr-description"
                value={prDescription}
                onChange={(e) => setPrDescription(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter pull request description"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Before creating the pull request:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Review the generated test files</li>
                    <li>Ensure the PR title and description are accurate</li>
                    <li>The tests will be added to a new branch</li>
                    <li>You can modify the tests after the PR is created</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Test Code
        </button>
        
        <button
          onClick={handleCreatePR}
          disabled={isCreatingPR || !prTitle.trim()}
          className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingPR ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Creating Pull Request...</span>
            </>
          ) : (
            <>
              <GitPullRequest className="w-4 h-4 mr-2" />
              Create Pull Request
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewAndSubmit; 