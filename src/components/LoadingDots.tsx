export const LoadingDots = () => {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
    </div>
  );
};
