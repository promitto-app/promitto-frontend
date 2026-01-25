export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-white rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-4xl font-bold text-white">P</span>
          </div>
          <div className="absolute inset-0 border-4 border-white rounded-lg animate-pulse opacity-30"></div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-white text-xl font-medium tracking-wide">Loading</span>
          <div className="flex items-center gap-1.5">
            <span 
              className="w-1.5 h-1.5 bg-white rounded-full animate-bounce-dot" 
              style={{ animationDelay: '0ms' }}
            ></span>
            <span 
              className="w-1.5 h-1.5 bg-white rounded-full animate-bounce-dot" 
              style={{ animationDelay: '200ms' }}
            ></span>
            <span 
              className="w-1.5 h-1.5 bg-white rounded-full animate-bounce-dot" 
              style={{ animationDelay: '400ms' }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  )
}
