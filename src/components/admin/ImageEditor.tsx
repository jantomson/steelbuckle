"use client";

import React, { useState } from "react";

interface Props {
  content: {
    src: string;
    width: number;
    height: number;
  };
  onChange: (image: { src: string; width: number; height: number }) => void;
}

export default function ImageEditor({ content, onChange }: Props) {
  const [image, setImage] = useState(content);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const newImage = {
        ...image,
        src: data.src,
        width: data.width,
        height: data.height,
      };

      setImage(newImage);
      onChange(newImage);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {image && (
        <img
          src={image.src}
          alt="Uploaded"
          width={image.width}
          height={image.height}
        />
      )}
    </div>
  );
}
