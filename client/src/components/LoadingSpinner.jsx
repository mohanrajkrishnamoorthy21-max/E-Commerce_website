const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center py-8">{spinner}</div>;
};

export default LoadingSpinner;
