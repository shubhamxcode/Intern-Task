import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Folder, 
  File, 
  Code, 
  CheckSquare, 
  Square, 
  Home,
  Eye
} from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useAppStore } from '../context/useAppStore';
import apiService from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface FileItem {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'dir';
  downloadUrl?: string;
  htmlUrl: string;
  isTextFile?: boolean;
}

const FileSelector: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    selectedRepository, 
    repositoryContents, 
    setRepositoryContents,
    selectedFiles,
    addSelectedFile,
    removeSelectedFile,
    setCurrentStep,
    breadcrumbs,
    setBreadcrumbs
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [_currentPath, setCurrentPath] = useState('');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (selectedRepository && !repositoryContents) {
      loadRepositoryContents('');
    }
  }, [selectedRepository]);

  const loadRepositoryContents = async (path: string) => {
    if (!user?.accessToken || !selectedRepository) return;

    setIsLoading(true);
    try {
      const response = await apiService.getRepositoryContents(
        user.accessToken,
        selectedRepository.owner.login,
        selectedRepository.name,
        path
      );
      
      setRepositoryContents(response);
      setCurrentPath(path);
      
      // Update breadcrumbs
      const pathSegments = path ? path.split('/') : [];
      const newBreadcrumbs = [
        { name: selectedRepository.name, path: '' },
        ...pathSegments.map((segment, index) => ({
          name: segment,
          path: pathSegments.slice(0, index + 1).join('/')
        }))
      ];
      setBreadcrumbs(newBreadcrumbs);
      
    } catch (error) {
      console.error('Failed to load repository contents:', error);
      toast.error('Failed to load repository contents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderClick = (folder: FileItem) => {
    loadRepositoryContents(folder.path);
  };

  const handleBreadcrumbClick = (path: string) => {
    loadRepositoryContents(path);
  };

  const handleFileToggle = (file: FileItem) => {
    const isSelected = selectedFiles.some(f => f.path === file.path);
    if (isSelected) {
      removeSelectedFile(file);
      toast.success(`Removed ${file.name} from selection`);
    } else {
      if (selectedFiles.length >= 5) {
        toast.error('Maximum 5 files can be selected');
        return;
      }
      addSelectedFile(file);
      toast.success(`Added ${file.name} to selection`);
    }
  };

  const handleFilePreview = async (file: FileItem) => {
    if (!file.isTextFile || !user?.accessToken || !selectedRepository) return;
    
    setIsLoadingPreview(true);
    setPreviewFile(file);
    
    try {
      const response = await apiService.getFileContent(
        user.accessToken,
        selectedRepository.owner.login,
        selectedRepository.name,
        file.path
      );
      setFileContent(response.file.content);
    } catch (error) {
      console.error('Failed to load file content:', error);
      toast.error('Failed to load file preview');
      setFileContent('Failed to load file content');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleNext = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }
    setCurrentStep('summaries');
    toast.success(`Selected ${selectedFiles.length} files for test generation`);
  };

  const handleBack = () => {
    setCurrentStep('repositories');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'dir') return <Folder className="w-5 h-5 text-blue-500" />;
    if (file.isTextFile) return <Code className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  if (!selectedRepository) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No repository selected</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Select Files
          </h2>
          <p className="text-gray-600">
            Choose the code files you want to generate test cases for.
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
            onClick={handleNext}
            disabled={selectedFiles.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Selected Files Summary */}
      {selectedFiles.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Selected Files ({selectedFiles.length}/5)
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map(file => (
              <span
                key={file.path}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {file.name}
                <button
                  onClick={() => handleFileToggle(file)}
                  className="ml-1 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="inline-flex items-center">
              {index > 0 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
              )}
              <button
                onClick={() => handleBreadcrumbClick(crumb.path)}
                className={`text-sm font-medium hover:text-blue-600 ${
                  index === 0 ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {index === 0 && <Home className="w-4 h-4 mr-1 inline" />}
                {crumb.name}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Browser */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Loading files...</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Folders */}
              {repositoryContents?.folders.map((folder) => (
                <div
                  key={folder.path}
                  className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="flex items-center">
                    {getFileIcon(folder)}
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {folder.name}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}

              {/* Files */}
              {repositoryContents?.files.map((file) => {
                const isSelected = selectedFiles.some(f => f.path === file.path);
                return (
                  <div
                    key={file.path}
                    className={`flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      {getFileIcon(file)}
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {file.name}
                          </span>
                          {file.isTextFile && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Code file
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {file.isTextFile && (
                        <button
                          onClick={() => handleFilePreview(file)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Preview file"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      
                      {file.isTextFile && (
                        <button
                          onClick={() => handleFileToggle(file)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title={isSelected ? 'Remove from selection' : 'Add to selection'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {repositoryContents && 
               repositoryContents.folders.length === 0 && 
               repositoryContents.files.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">This folder is empty</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* File Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-96">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900">
                {previewFile ? `Preview: ${previewFile.name}` : 'File Preview'}
              </h3>
            </div>
            <div className="p-4 h-full overflow-auto">
              {isLoadingPreview ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="sm" />
                </div>
              ) : previewFile && fileContent ? (
                <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                  {fileContent.length > 1000 
                    ? fileContent.substring(0, 1000) + '\n\n... (truncated)'
                    : fileContent
                  }
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Eye className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Click on a file to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileSelector; 