"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const ReactPhotoSphereViewer = dynamic(
  () => import('react-photo-sphere-viewer').then((mod) => mod.ReactPhotoSphereViewer),
  {
    ssr: false,
    loading: () => <div className="text-white">Loading 360 Viewer...</div>,
  }
);

interface ThreeSixtyViewerProps {
  imageUrl: string;
}

const ThreeSixtyViewer: React.FC<ThreeSixtyViewerProps> = ({ imageUrl }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="w-full h-full">
        <ReactPhotoSphereViewer src={imageUrl} height={'100vh'} width={"100%"} />
      </div>
    </div>
  );
};

export default ThreeSixtyViewer;