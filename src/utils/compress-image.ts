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

/**
 * 压缩图片
 * @param file
 * @param encoder
 */
export const compressImage = async (file: File, encoder: CompressEncoderEnum) => {
  if (!isNeedCompress(file.type)) {
    return file
  }

  if (encoder === CompressEncoderEnum.jpegEXIF) {
    return new Promise((resolve, reject) => {
      imageCompression(file, { initialQuality: 0.8, preserveExif: true, fileType: 'image/jpeg' })
        .then(function (compressedFile) {
          const jpeg = new File([compressedFile], file.name.replace(/\.[^/.]+$/, '.jpeg'))
          return resolve(jpeg)
        })
        .catch(function (error) {
          console.log(error.message)
          reject(error.message)
        })
    })
  }

  const compress = new Compress(file, {
    encoderState: {
      type: encoder,
      options: encoderMap[encoder].meta.defaultOptions
    } as EncoderState,
    processorState: defaultProcessorState,
    preprocessorState: defaultPreprocessorState
  })
  return compress.process()
}
