import { PluginPlatform, getDisplayNameFromPluginPlatform } from '@/models/common'
import Tooltip from '@/app/components/base/tooltip'
import { RiDownloadCloud2Line } from '@remixicon/react'
import React from 'react'
import Button from '@/app/components/base/button'

type DownloadButtonsProps = {
  downloadMutate: (platform: PluginPlatform) => void
  t: (key: string) => string,
  className?: string
}

const PlatformDownloadButtons = (props: DownloadButtonsProps) => {
  const buttons = [
    { platform: PluginPlatform.x86_64, color: 'text-indigo-500' },
    { platform: PluginPlatform.aarch64, color: 'text-purple-500' },
  ]

  return (
    <>
      {
        buttons.map(({ platform, color }) => (
          <Tooltip key={platform} popupContent={`${props.t('common.operation.download')} (${getDisplayNameFromPluginPlatform(platform)})`}>
            <Button
              key={`btn-${platform}`}
              className={`${props.className}`}
              onClick={() => props.downloadMutate(platform)}>
              <div
                className={'flex h-[1.5rem] w-4 cursor-pointer items-center justify-center rounded-lg'}
              >
                <RiDownloadCloud2Line className={`h-4 w-4 ${color}`}/>
              </div>
            </Button>
          </Tooltip>
        ))
      }
    </>
  )
}

export default PlatformDownloadButtons
