"use client";
import { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Ensure you have "default" here
export default function ExpandableImage({ src, className }: { src: string, className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>
        <img src={src} className={className} />
      </div>
      <Lightbox
  open={open}
  close={() => setOpen(false)}
  slides={[{ src }]}
  // This disables the infinite "looping" behavior
  carousel={{ finite: true }} 
  // This explicitly hides the buttons if there is only 1 slide
  render={{ 
    buttonPrev: () => null, 
    buttonNext: () => null 
  }}
/>
    </>
  );
}