import React from "react"

import "./image-list.scss"

interface ImageTile {
  name: string
  src: string
}

interface ImageListProps {
  images: ImageTile[]
}

const ImageList = ({ images }: ImageListProps) => {
  return (
    <div className="image-list__image-list">
      {images.map(image => (
        <div key={image.src} className="image-list__image-tile">
          <h3 className="image-list__image-title">{image.name}</h3>
          <div className="image-list__image-container">
            <img src={image.src} className="image-list__image" />
          </div>
        </div>
      ))}
    </div>
  )
}

export { ImageList }
