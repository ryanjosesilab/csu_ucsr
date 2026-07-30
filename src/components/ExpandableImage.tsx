"use client";
import { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

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
        carousel={{ finite: true }} 
        render={{ 
          buttonPrev: () => null, 
          buttonNext: () => null 
        }}
        // ADDED: Forces the lightbox to always render on top of your fixed navbar
       styles={{ root: { zIndex: 99999 } }}
      />
    </>
  );
}