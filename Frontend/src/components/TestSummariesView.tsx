import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Eye,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useAppStore } from '../context/useAppStore';
import apiService from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface TestSummary {
  id: string;
  title: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  file: string;
  priority: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'medium' | 'complex';
  framework: string;
  createdAt: string;
}

const TestSummariesView: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    selectedRepository,
    selectedFiles,
    testSummaries,
    setTestSummaries,
    selectedSummaries,
    addSelectedSummary,
    removeSelectedSummary,
    setCurrentStep
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSummaryForPreview, setSelectedSummaryForPreview] = useState<TestSummary | null>(null);

  useEffect(() => {
    if (selectedFiles.length > 0 && testSummaries.length === 0) {
      generateTestSummaries();
    }
  }, [selectedFiles]);

  const generateTestSummaries = async () => {
    if (!user?.accessToken || !selectedRepository || selectedFiles.length === 0) {
      toast.error('Missing required data for test generation');
      return;
    }

    setIsGenerating(true);
    try {
      const filesForGeneration = selectedFiles.map(file => ({ path: file.path }));
      
      const response = await apiService.generateTestSummaries(
        user.accessToken,
        filesForGeneration,
        selectedRepository.owner.login,
        selectedRepository.name
      );

      setTestSummaries(response.summaries);
      toast.success(`Generated ${response.summaries.length} test case summaries!`);
    } catch (error) {
      console.error('Failed to generate test summaries:', error);
      toast.error('Failed to generate test summaries. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSummaryToggle = (summary: TestSummary) => {
    const isSelected = selectedSummaries.some(s => s.id === summary.id);
    if (isSelected) {
      removeSelectedSummary(summary);
      toast.success(`Removed "${summary.title}" from selection`);
    } else {
      addSelectedSummary(summary);
      toast.success(`Added "${summary.title}" to selection`);
    }
  };

  const handleNext = () => {
    if (selectedSummaries.length === 0) {
      toast.error('Please select at least one test summary');
      return;
    }
    setCurrentStep('tests');
    toast.success(`Selected ${selectedSummaries.length} test summaries for code generation`);
  };

  const handleBack = () => {
    setCurrentStep('files');
  };

  const handleRegenerateAll = () => {
    setTestSummaries([]);
    generateTestSummaries();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'simple': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'complex': return <Clock className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'unit': return 'bg-blue-100 text-blue-800';
      case 'integration': return 'bg-purple-100 text-purple-800';
      case 'e2e': return 'bg-indigo-100 text-indigo-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedSummaries = testSummaries.reduce((acc, summary) => {
    if (!acc[summary.file]) {
      acc[summary.file] = [];
    }
    acc[summary.file].push(summary);
    return acc;
  }, {} as Record<string, TestSummary[]>);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI-Generated Test Summaries
          </h2>
          <p className="text-gray-600">
            Review and select the test cases you want to generate code for.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <button
            onClick={handleRegenerateAll}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
          <button
            onClick={handleNext}
            disabled={selectedSummaries.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Code
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Selected Summaries Counter */}
      {selectedSummaries.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Selected Test Summaries ({selectedSummaries.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedSummaries.map(summary => (
              <span
                key={summary.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {summary.title.substring(0, 30)}...
                <button
                  onClick={() => handleSummaryToggle(summary)}
                  className="ml-1 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Generation Status */}
      {isGenerating ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            AI is analyzing your code...
          </h3>
          <p className="text-gray-600 mb-4">
            This may take a moment while we generate comprehensive test case summaries.
          </p>
          <LoadingSpinner size="lg" />
        </div>
      ) : testSummaries.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Zap className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No test summaries available
          </h3>
          <p className="text-gray-600 mb-6">
            Click "Regenerate" to generate test case summaries for your selected files.
          </p>
          <button
            onClick={generateTestSummaries}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Test Summaries
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Summaries List */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedSummaries).map(([fileName, summaries]) => (
              <div key={fileName} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {fileName.split('/').pop()}
                  </h3>
                  <p className="text-sm text-gray-500">{fileName}</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {summaries.map((summary) => {
                    const isSelected = selectedSummaries.some(s => s.id === summary.id);
                    return (
                      <div
                        key={summary.id}
                        className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => handleSummaryToggle(summary)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="text-base font-medium text-gray-900 mr-3">
                                {summary.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(summary.type)}`}>
                                  {summary.type}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(summary.priority)}`}>
                                  {summary.priority}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">
                              {summary.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center">
                                  {getComplexityIcon(summary.complexity)}
                                  <span className="ml-1 capitalize">{summary.complexity}</span>
                                </div>
                                <span>Framework: {summary.framework}</span>
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSummaryForPreview(summary);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                <Eye className="w-4 h-4 inline mr-1" />
                                Preview
                              </button>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {isSelected ? (
                              <CheckCircle className="w-6 h-6 text-blue-600" />
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-6">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900">
                  {selectedSummaryForPreview ? 'Test Case Preview' : 'Test Case Details'}
                </h3>
              </div>
              
              <div className="p-4">
                {selectedSummaryForPreview ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        {selectedSummaryForPreview.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedSummaryForPreview.description}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedSummaryForPreview.type)}`}>
                          {selectedSummaryForPreview.type}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Priority:</span>
                        <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedSummaryForPreview.priority)}`}>
                          {selectedSummaryForPreview.priority}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Complexity:</span>
                        <div className="mt-1 flex items-center">
                          {getComplexityIcon(selectedSummaryForPreview.complexity)}
                          <span className="ml-1 capitalize">{selectedSummaryForPreview.complexity}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Framework:</span>
                        <div className="mt-1 font-medium">
                          {selectedSummaryForPreview.framework}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-500">Target File:</span>
                      <div className="mt-1 text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                        {selectedSummaryForPreview.file}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Eye className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Click on a test summary to preview details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSummariesView; 