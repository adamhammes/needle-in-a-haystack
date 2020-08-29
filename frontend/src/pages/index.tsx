import React, { useState } from "react"

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
      const dataUrl = reader.result as string
      resolve(dataUrl.replace(dataSrcPrefix, ""))
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
    <div
      style={{
        maxWidth: "40rem",
        padding: "1rem",
        margin: "0 auto",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      }}
    >
      <h1>Upload an image</h1>
      <input
        type="file"
        onChange={event => setSelectedFiles(event.target.files)}
      />
      <div style={{ marginBottom: "1rem" }}>
        <button disabled={!selectedFiles} onClick={uploadFiles}>
          upload
        </button>
      </div>
      {!!apiResponse && (
        <div>
          <div style={{ marginBottom: "1rem" }}>
            Severity: {apiResponse.severity}
          </div>

          {Object.entries(apiResponse.images).map(
            ([imageName, imageBase64]) => (
              <div
                key={imageName}
                style={{
                  boxShadow:
                    "box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);",
                }}
              >
                <img
                  style={{
                    width: "20rem",
                    height: "20rem",
                    objectFit: "cover",
                    marginBottom: "2rem",
                  }}
                  src={dataSrcPrefix + imageBase64}
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
