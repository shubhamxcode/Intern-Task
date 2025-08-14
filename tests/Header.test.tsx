import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Frontend/src/components/Header';
import { useAuthStore } from '../Frontend/src/context/useAuthStore';
import { useAppStore } from '../Frontend/src/context/useAppStore';
import { useNavigate } from 'react-router-dom';
import { act } from 'react-dom/test-utils';


jest.mock('../Frontend/src/context/useAuthStore', () => ({
  useAuthStore: () => ({
    user: null,
    logout: jest.fn(),
    refreshUserData: jest.fn(),
  }),
}));

jest.mock('../Frontend/src/context/useAppStore', () => ({
  useAppStore: () => ({
    reset: jest.fn(),
  }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));


describe('Header Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly without user data', () => {
    const mockUseAuthStore = jest.mocked(useAuthStore);
    mockUseAuthStore.mockReturnValue({ user: null, logout: jest.fn(), refreshUserData: jest.fn() });
    render(<Header />);
    expect(screen.queryByText('TestCraft')).toBeInTheDocument();
    expect(screen.queryByText(/@/i)).not.toBeInTheDocument(); // Username should not be present
  });

  it('renders correctly with user data and valid avatar', () => {
    const mockUseAuthStore = jest.mocked(useAuthStore);
    mockUseAuthStore.mockReturnValue({
      user: {
        avatar: 'https://example.com/avatar.jpg',
        name: 'Test User',
        username: 'testuser',
      },
      logout: jest.fn(),
      refreshUserData: jest.fn(),
    });
    render(<Header />);
    expect(screen.getByText('TestCraft')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders correctly with user data and invalid avatar, fallback to github', () => {
    const mockUseAuthStore = jest.mocked(useAuthStore);
    mockUseAuthStore.mockReturnValue({
      user: {
        avatar: 'invalid-avatar-url',
        name: 'Test User',
        username: 'testuser',
      },
      logout: jest.fn(),
      refreshUserData: jest.fn(),
    });
    render(<Header />);
    expect(screen.getByText('TestCraft')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://github.com/testuser.png');
  });

  it('renders correctly with user data and no avatar', () => {
    const mockUseAuthStore = jest.mocked(useAuthStore);
    mockUseAuthStore.mockReturnValue({
      user: {
        name: 'Test User',
        username: 'testuser',
      },
      logout: jest.fn(),
      refreshUserData: jest.fn(),
    });
    render(<Header />);
    expect(screen.getByText('TestCraft')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://github.com/testuser.png');
  });


  it('handles logout correctly', async () => {
    const mockLogout = jest.fn();
    const mockResetAppStore = jest.fn();
    const mockNavigate = jest.fn();
    const mockUseAuthStore = jest.mocked(useAuthStore);
    const mockUseAppStore = jest.mocked(useAppStore);
    mockUseAuthStore.mockReturnValue({ user: { name: 'Test User', username: 'testuser' }, logout: mockLogout, refreshUserData: jest.fn() });
    mockUseAppStore.mockReturnValue({ reset: mockResetAppStore });
    jest.mocked(useNavigate).mockReturnValue(mockNavigate);

    render(<Header />);
    const logoutButton = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(logoutButton);

    expect(mockResetAppStore).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    expect(jest.mocked(toast.success)).toHaveBeenCalledWith('Signed out successfully - all data cleared');
  });


  it('handles refresh correctly', async () => {
    const mockRefreshUserData = jest.fn();
    const mockUseAuthStore = jest.mocked(useAuthStore);
    mockUseAuthStore.mockReturnValue({ user: { name: 'Test User', username: 'testuser' }, logout: jest.fn(), refreshUserData: mockRefreshUserData });
    render(<Header />);
    const refreshButton = screen.getByRole('button', { name: /Refresh Data/i });
    await act(async () => {
      fireEvent.click(refreshButton);
    });
    expect(mockRefreshUserData).toHaveBeenCalled();
    expect(jest.mocked(toast.success)).toHaveBeenCalledWith('User data refreshed');
  });

  it('handles refresh error correctly', async () => {
    const mockRefreshUserData = jest.fn().mockRejectedValue(new Error('Refresh failed'));
    const mockUseAuthStore = jest.mocked(useAuthStore);
    mockUseAuthStore.mockReturnValue({ user: { name: 'Test User', username: 'testuser' }, logout: jest.fn(), refreshUserData: mockRefreshUserData });
    render(<Header />);
    const refreshButton = screen.getByRole('button', { name: /Refresh Data/i });
    await act(async () => {
      fireEvent.click(refreshButton);
    });
    expect(mockRefreshUserData).toHaveBeenCalled();
    expect(jest.mocked(toast.error)).toHaveBeenCalledWith('Failed to refresh user data');
  });

});