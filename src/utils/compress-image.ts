import Compress from '@yireen/squoosh-browser'
import imageCompression from 'lfk-browser-image-compression'
import {
  defaultPreprocessorState,
  defaultProcessorState,
  encoderMap,
  EncoderState
} from '@yireen/squoosh-browser/dist/client/lazy-app/feature-meta'
import { CompressEncoderEnum } from '@/common/model'
import { isNeedCompress } from '@/utils/file-utils'
import { insert, load, dump } from '@asc0910/exif-library'

/**
 * 压缩图片
 * @param file
 * @param encoder
 */
export const compressImage = async (file: File, encoder: CompressEncoderEnum) => {
  if (!isNeedCompress(file.type)) {
    return file
  }

  const compress = new Compress(file, {
    encoderState: {
      type: encoder,
      options: encoderMap[encoder].meta.defaultOptions
    } as EncoderState,
    processorState: defaultProcessorState,
    preprocessorState: defaultPreprocessorState
  })

  function readFileAsString(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        resolve(reader.result as string)
      }

      reader.onerror = () => {
        reader.abort()
        reject(new DOMException('Problem parsing input file.'))
      }

      reader.readAsBinaryString(file)
    })
  }

  function writeFileWithBuffer(data: string) {
    const len = data.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = data.charCodeAt(i)
    }
    return bytes
  }

  const data = await readFileAsString(file)
  const result = await compress.process()
  const originEXIF = load(data)
  console.log(originEXIF)
  const newData = await readFileAsString(result)
  const newDataWithEXIF = insert(dump(originEXIF), newData)
  return new File([writeFileWithBuffer(newDataWithEXIF)], result.name, { type: result.type })
}
