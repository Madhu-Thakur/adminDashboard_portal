 import React from "react";

export default function FilePreview({ fileUrl }) {
  if (!fileUrl) {
    return <p>File URL is not available.</p>;
  }

  const cleanUrl = fileUrl.trim();

  const isWordFile = /\.(docx?|doc)(\?.*)?$/i.test(
    cleanUrl.split("/").pop() || ""
  );

  const previewUrl = isWordFile
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cleanUrl)}`
    : cleanUrl;

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <iframe
        src={previewUrl}
        title="Uploaded File Preview"
        width="100%"
        height="100%"
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
        allowFullScreen
      />
    </div>
  );
}