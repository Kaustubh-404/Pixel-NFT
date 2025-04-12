export function PixelLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="pixel-loader"></div>
      <p className="mt-4 font-pixel text-xs text-pixel-green animate-pixel-fade">Loading...</p>
    </div>
  )
}
