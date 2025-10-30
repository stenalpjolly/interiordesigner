interface LoadingScreenProps {
  text: string;
  subtext?: string;
}

export default function LoadingScreen({ text, subtext }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="spinner border-4 border-gray-600 border-t-blue-500 rounded-full w-10 h-10 animate-spin"></div>
      <p className="text-lg font-semibold mt-4 text-blue-300">{text}</p>
      {subtext && <p className="text-gray-400">{subtext}</p>}
    </div>
  );
}