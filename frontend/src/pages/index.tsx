import React, { useState } from "react"

import "./index.scss"
import { ImageList } from "../components/image-list"

const lambdaUrl = "https://k3bth73v75.execute-api.us-east-1.amazonaws.com/dev"

const dataSrcPrefix = "data:image/jpeg;base64,"

interface ApiImages {
  gray: string
  threshold: string
  stomata: string
}

interface ApiResponse {
  severity: number
  images: ApiImages
}

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const dataUrl = reader.result
      if (typeof dataUrl === "string") {
        resolve(dataUrl.replace(dataSrcPrefix, ""))
      } else {
        reject()
      }
    }
    reader.onerror = error => reject(error)
  })
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState(
    undefined as undefined | FileList
  )

  const [apiResponse, setApiResponse] = useState(
    undefined as undefined | ApiResponse
  )

  console.log(selectedFiles)

  const uploadFiles = async () => {
    if (selectedFiles != null && selectedFiles.length > 0) {
      const encodedFile = await fileToBase64(selectedFiles[0])

      const response = await fetch(lambdaUrl, {
        method: "POST",
        body: JSON.stringify({
          image_name: selectedFiles[0].name,
          image_body: encodedFile,
        }),
      })

      setApiResponse(await response.json())
    }
  }

  return (
    <div className="app__container">
      <h1>Upload an image</h1>
      <input
        type="file"
        onChange={event => setSelectedFiles(event.target.files)}
      />
      <div className="app__upload-button-container">
        <button disabled={!selectedFiles} onClick={uploadFiles}>
          upload
        </button>
      </div>
      {!!apiResponse && (
        <div>
          <div>Severity: {apiResponse.severity}</div>

          <ImageList
            images={Object.entries(apiResponse.images).map(
              ([name, base64]) => ({
                name,
                src: dataSrcPrefix + base64,
              })
            )}
          />
        </div>
      )}
    </div>
  )
}
