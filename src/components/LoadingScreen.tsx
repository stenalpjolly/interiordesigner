interface LoadingScreenProps {
  text: string;
  subtext?: string;
}

export default function LoadingScreen({ text, subtext }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 border-4 border-blue-400/20 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-xl font-semibold mt-5 text-white">{text}</p>
      {subtext && <p className="text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}