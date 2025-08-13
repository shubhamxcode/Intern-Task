import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  owner: {
    login: string;
    avatar: string;
  };
  htmlUrl: string;
  language: string;
  stargazersCount: number;
  forksCount: number;
  defaultBranch: string;
  pushedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface FileItem {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'dir';
  downloadUrl?: string;
  htmlUrl: string;
  isTextFile?: boolean;
}

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

interface GeneratedTest {
  fileName: string;
  content: string;
  framework: string;
  sourceFile: string;
  testSummary: TestSummary;
  generatedAt: string;
}

interface AppState {
  // Repository management
  repositories: Repository[];
  selectedRepository: Repository | null;
  repositoryContents: {
    folders: FileItem[];
    files: FileItem[];
    path: string;
  } | null;
  
  // File selection
  selectedFiles: FileItem[];
  
  // Test case generation
  testSummaries: TestSummary[];
  generatedTests: GeneratedTest[];
  selectedSummaries: TestSummary[];
  
  // UI state
  currentStep: 'repositories' | 'files' | 'summaries' | 'tests' | 'review';
  isLoading: boolean;
  error: string | null;
  
  // Navigation breadcrumbs
  breadcrumbs: Array<{ name: string; path: string }>;
  
  // Actions
  setRepositories: (repositories: Repository[]) => void;
  setSelectedRepository: (repository: Repository | null) => void;
  setRepositoryContents: (contents: { folders: FileItem[]; files: FileItem[]; path: string }) => void;
  addSelectedFile: (file: FileItem) => void;
  removeSelectedFile: (file: FileItem) => void;
  clearSelectedFiles: () => void;
  setTestSummaries: (summaries: TestSummary[]) => void;
  addGeneratedTest: (test: GeneratedTest) => void;
  setGeneratedTests: (tests: GeneratedTest[]) => void;
  addSelectedSummary: (summary: TestSummary) => void;
  removeSelectedSummary: (summary: TestSummary) => void;
  clearSelectedSummaries: () => void;
  setCurrentStep: (step: AppState['currentStep']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ name: string; path: string }>) => void;
  reset: () => void;
}

const initialState = {
  repositories: [],
  selectedRepository: null,
  repositoryContents: null,
  selectedFiles: [],
  testSummaries: [],
  generatedTests: [],
  selectedSummaries: [],
  currentStep: 'repositories' as const,
  isLoading: false,
  error: null,
  breadcrumbs: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setRepositories: (repositories) => {
        set({ repositories });
      },

      setSelectedRepository: (repository) => {
        set({ 
          selectedRepository: repository,
          repositoryContents: null,
          selectedFiles: [],
          testSummaries: [],
          generatedTests: [],
          selectedSummaries: [],
          breadcrumbs: repository ? [{ name: repository.name, path: '' }] : [],
        });
      },

      setRepositoryContents: (contents) => {
        set({ repositoryContents: contents });
      },

      addSelectedFile: (file) => {
        const { selectedFiles } = get();
        const isAlreadySelected = selectedFiles.some(f => f.path === file.path);
        if (!isAlreadySelected) {
          set({ selectedFiles: [...selectedFiles, file] });
        }
      },

      removeSelectedFile: (file) => {
        const { selectedFiles } = get();
        set({ selectedFiles: selectedFiles.filter(f => f.path !== file.path) });
      },

      clearSelectedFiles: () => {
        set({ selectedFiles: [] });
      },

      setTestSummaries: (summaries) => {
        set({ testSummaries: summaries });
      },

      addGeneratedTest: (test) => {
        const { generatedTests } = get();
        set({ generatedTests: [...generatedTests, test] });
      },

      setGeneratedTests: (tests) => {
        set({ generatedTests: tests });
      },

      addSelectedSummary: (summary) => {
        const { selectedSummaries } = get();
        const isAlreadySelected = selectedSummaries.some(s => s.id === summary.id);
        if (!isAlreadySelected) {
          set({ selectedSummaries: [...selectedSummaries, summary] });
        }
      },

      removeSelectedSummary: (summary) => {
        const { selectedSummaries } = get();
        set({ selectedSummaries: selectedSummaries.filter(s => s.id !== summary.id) });
      },

      clearSelectedSummaries: () => {
        set({ selectedSummaries: [] });
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      setBreadcrumbs: (breadcrumbs) => {
        set({ breadcrumbs });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedRepository: state.selectedRepository,
        selectedFiles: state.selectedFiles,
        testSummaries: state.testSummaries,
        generatedTests: state.generatedTests,
        selectedSummaries: state.selectedSummaries,
        currentStep: state.currentStep,
      }),
    }
  )
); 