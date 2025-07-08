'use client'
import { useTheme } from 'next-themes'
import { RiArrowRightUpLine } from '@remixicon/react'
import { getPluginDetailLinkInMarketplace, getPluginLinkInMarketplace } from '../utils'
import Card from '@/app/components/plugins/card'
import CardMoreInfo from '@/app/components/plugins/card/card-more-info'
import type { Plugin } from '@/app/components/plugins/types'
import Button from '@/app/components/base/button'
import { useMixedTranslation } from '@/app/components/plugins/marketplace/hooks'
import InstallFromMarketplace from '@/app/components/plugins/install-plugin/install-from-marketplace'
import { useBoolean } from 'ahooks'
import { useI18N } from '@/context/i18n'
import { useTags } from '@/app/components/plugins/hooks'
import React from 'react'
import { useMutation } from '@tanstack/react-query'
import Toast from '@/app/components/base/toast'
import { downloadPlugin as apiDownloadPlugin } from '@/service/plugins'
import PlatformDownloadButtons from '@/app/components/plugins/marketplace/buttons/platform-download-buttons'
import type { PluginPlatform } from '@/models/common'
import Loading from '@/app/components/base/loading'

type CardWrapperProps = {
  plugin: Plugin
  showInstallButton?: boolean
  locale?: string
}

const CardWrapper = ({
                       plugin,
                       showInstallButton,
                       locale,
                     }: CardWrapperProps) => {
  const { t } = useMixedTranslation(locale)
  const { theme } = useTheme()
  const [isShowInstallFromMarketplace, {
    setTrue: showInstallFromMarketplace,
    setFalse: hideInstallFromMarketplace,
  }] = useBoolean(false)
  const { locale: localeFromLocale } = useI18N()
  const { tagsMap } = useTags(t)

  const { mutate: downloadMutate, isPending } = useMutation({
    mutationKey: ['downloadPlugin', plugin.plugin_id],
    mutationFn: ({ platform }: {
      platform: PluginPlatform
    }) => apiDownloadPlugin(plugin.org, plugin.name, plugin.latest_version, platform),
    onSuccess: ({ downloadUrl, filename }) => {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      Toast.notify({ type: 'success', message: t('common.operation.downloadSuccess') })
    },
    onError: (error) => {
      console.error('Download failed:', error)
      Toast.notify({ type: 'error', message: t('common.operation.downloadFailed') })
    },
  })
  if (isPending) {
    return (
      <div className='group relative cursor-pointer rounded-xl bg-components-panel-on-panel-item-bg'>
        <Loading type='app'/>
      </div>
    )
  }

  if (showInstallButton) {
    return (
      <div
        className='group relative cursor-pointer rounded-xl  hover:bg-components-panel-on-panel-item-bg-hover'
      >
        <Card
          key={plugin.name}
          payload={plugin}
          locale={locale}
          footer={
            <CardMoreInfo
              downloadCount={plugin.install_count}
              tags={plugin.tags.map(tag => tagsMap[tag.name].label)}
            />
          }
        />
        {
          <div
            className='absolute bottom-0 hidden w-full items-center space-x-2 rounded-b-xl bg-gradient-to-tr from-components-panel-on-panel-item-bg to-background-gradient-mask-transparent px-4 pb-4 pt-8 group-hover:flex'>
            <Button
              variant='primary'
              className='w-[calc(40%-4px)]'
              onClick={showInstallFromMarketplace}
            >
              {t('plugin.detailPanel.operation.install')}
            </Button>
            <a href={getPluginLinkInMarketplace(plugin, { language: localeFromLocale, theme })} target='_blank'
               className='block w-[calc(40%-4px)] flex-1 shrink-0'>
              <Button
                className='w-full gap-0.5'
              >
                {t('plugin.detailPanel.operation.detail')}
                <RiArrowRightUpLine className='ml-1 h-4 w-4'/>
              </Button>
            </a>
            <PlatformDownloadButtons className='w-[calc(10%-4px)] flex-1 shrink-0' downloadMutate={platform => downloadMutate({ platform })} t={t}/>
          </div>
        }
        {
          isShowInstallFromMarketplace && (
            <InstallFromMarketplace
              manifest={plugin}
              uniqueIdentifier={plugin.latest_package_identifier}
              onClose={hideInstallFromMarketplace}
              onSuccess={hideInstallFromMarketplace}
            />
          )
        }
      </div>
    )
  }

  return (
    <a
      className='group relative inline-block cursor-pointer rounded-xl'
      href={getPluginDetailLinkInMarketplace(plugin)}
    >
      <Card
        key={plugin.name}
        payload={plugin}
        locale={locale}
        footer={
          <CardMoreInfo
            downloadCount={plugin.install_count}
            tags={plugin.tags.map(tag => tagsMap[tag.name].label)}
          />
        }
      />
    </a>
  )
}

export default CardWrapper
