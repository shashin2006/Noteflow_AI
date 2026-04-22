export default function ScrollIndicator() {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-400 mb-2">Scroll down</span>
      <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
        <div className="w-1 h-2 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
      </div>
    </div>
  );
}