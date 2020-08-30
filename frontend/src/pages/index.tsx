import React, { useState } from "react"

import serializeToCSV from "csv-stringify/lib/sync"

import "./index.scss"

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

interface ImageResult extends ApiResponse {
  originalImage: string
  originalImageName: string
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

const downloadCSV = (results: ImageResult[]) => {
  const rows = [
    ["Image Name", "Severity"],
    ...results.map(result => [result.originalImageName, result.severity]),
  ]

  const csvContent = serializeToCSV(rows)
  const csvDataURI = encodeURI("data:text/csv;charset=utf-8," + csvContent)
  window.open(csvDataURI)
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState(
    undefined as undefined | FileList
  )

  const [results, setResults] = useState(undefined as undefined | ImageResult[])

  const uploadFiles = async () => {
    if (selectedFiles != null && selectedFiles.length > 0) {
      setResults(
        await Promise.all(
          [...selectedFiles].map(async file => {
            const encodedFile = await fileToBase64(file)
            const response = await fetch(lambdaUrl, {
              method: "POST",
              body: JSON.stringify({
                image_name: file.name,
                image_body: encodedFile,
              }),
            })

            const data: ApiResponse = await response.json()
            return {
              ...data,
              originalImage: dataSrcPrefix + encodedFile,
              originalImageName: file.name,
            }
          })
        )
      )
    }
  }

  return (
    <div className="app__container">
      <h2>Upload your images</h2>
      <input
        type="file"
        onChange={event => setSelectedFiles(event.target.files)}
        multiple={true}
      />
      <div className="app__upload-button-container">
        <button disabled={!selectedFiles} onClick={uploadFiles}>
          upload
        </button>
      </div>
      {!!results && (
        <>
          <h2>Results</h2>
          <button onClick={() => downloadCSV(results)}>
            Download as a CSV
          </button>
          <ul className="result__listing">
            {results.map(result => (
              <li key={result.originalImage} className="result__item">
                <h3>{result.originalImageName}</h3>
                Severity: {result.severity}
                <div className="result__image-wrapper">
                  <img className="result__image" src={result.originalImage} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
