import type { Fetcher } from 'swr'
import { get, getMarketplace, post, upload } from './base'
import type {
  Dependency,
  InstallPackageResponse,
  Permissions,
  PluginDeclaration,
  PluginInfoFromMarketPlace,
  PluginManifestInMarket,
  PluginTasksResponse,
  TaskStatusResponse,
  UninstallPluginResponse,
  updatePackageResponse,
  uploadGitHubResponse,
} from '@/app/components/plugins/types'
import type {
  MarketplaceCollectionPluginsResponse,
  MarketplaceCollectionsResponse,
} from '@/app/components/plugins/marketplace/types'
import { MARKETPLACE_PLUGIN_INSTALL_AMD_API_PREFIX, MARKETPLACE_PLUGIN_INSTALL_ARM_API_PREFIX } from '@/config'
import { PluginPlatform } from '@/models/common'

export const uploadFile = async (file: File, isBundle: boolean) => {
  const formData = new FormData()
  formData.append(isBundle ? 'bundle' : 'pkg', file)
  return upload({
    xhr: new XMLHttpRequest(),
    data: formData,
  }, false, `/workspaces/current/plugin/upload/${isBundle ? 'bundle' : 'pkg'}`)
}

export const updateFromMarketPlace = async (body: Record<string, string>) => {
  return post<InstallPackageResponse>('/workspaces/current/plugin/upgrade/marketplace', {
    body,
  })
}

export const updateFromGitHub = async (repoUrl: string, selectedVersion: string, selectedPackage: string,
  originalPlugin: string, newPlugin: string) => {
  return post<updatePackageResponse>('/workspaces/current/plugin/upgrade/github', {
    body: {
      repo: repoUrl,
      version: selectedVersion,
      package: selectedPackage,
      original_plugin_unique_identifier: originalPlugin,
      new_plugin_unique_identifier: newPlugin,
    },
  })
}

export const uploadGitHub = async (repoUrl: string, selectedVersion: string, selectedPackage: string) => {
  return post<uploadGitHubResponse>('/workspaces/current/plugin/upload/github', {
    body: {
      repo: repoUrl,
      version: selectedVersion,
      package: selectedPackage,
    },
  })
}

export const fetchIcon = (tenantId: string, fileName: string) => {
  return get(`workspaces/current/plugin/icon?tenant_id=${tenantId}&filename=${fileName}`)
}

export const fetchManifest = async (uniqueIdentifier: string) => {
  return get<PluginDeclaration>(`/workspaces/current/plugin/fetch-manifest?plugin_unique_identifier=${uniqueIdentifier}`)
}

export const fetchManifestFromMarketPlace = async (uniqueIdentifier: string) => {
  return getMarketplace<{ data: { plugin: PluginManifestInMarket, version: { version: string } } }>(`/plugins/identifier?unique_identifier=${uniqueIdentifier}`)
}

export const fetchBundleInfoFromMarketPlace = async ({
  org,
  name,
  version,
}: Record<string, string>) => {
  return getMarketplace<{ data: { version: { dependencies: Dependency[] } } }>(`/bundles/${org}/${name}/${version}`)
}

export const fetchPluginInfoFromMarketPlace = async ({
  org,
  name,
}: Record<string, string>) => {
  return getMarketplace<{ data: { plugin: PluginInfoFromMarketPlace, version: { version: string } } }>(`/plugins/${org}/${name}`)
}

export const fetchMarketplaceCollections: Fetcher<MarketplaceCollectionsResponse, { url: string; }> = ({ url }) => {
  return get<MarketplaceCollectionsResponse>(url)
}

export const fetchMarketplaceCollectionPlugins: Fetcher<MarketplaceCollectionPluginsResponse, { url: string }> = ({ url }) => {
  return get<MarketplaceCollectionPluginsResponse>(url)
}

export const fetchPluginTasks = async () => {
  return get<PluginTasksResponse>('/workspaces/current/plugin/tasks?page=1&page_size=255')
}

export const checkTaskStatus = async (taskId: string) => {
  return get<TaskStatusResponse>(`/workspaces/current/plugin/tasks/${taskId}`)
}

export const updatePermission = async (permissions: Permissions) => {
  return post('/workspaces/current/plugin/permission/change', { body: permissions })
}

export const uninstallPlugin = async (pluginId: string) => {
  return post<UninstallPluginResponse>('/workspaces/current/plugin/uninstall', { body: { plugin_installation_id: pluginId } })
}

export const downloadPlugin = async (pluginAuthor: string, pluginName: string, pluginVersion: string, platform: PluginPlatform = PluginPlatform.x86_64) => {
  const apiPrefix = platform === PluginPlatform.x86_64 ? MARKETPLACE_PLUGIN_INSTALL_AMD_API_PREFIX : MARKETPLACE_PLUGIN_INSTALL_ARM_API_PREFIX

  const url = `${apiPrefix}/repackaging/repackage`
  const formData = new FormData()
  formData.append('source_type', 'market')
  formData.append('plugin_author', pluginAuthor)
  formData.append('plugin_name', pluginName)
  formData.append('plugin_version', pluginVersion)
  formData.append('platform', platform)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('console_token') || ''}`,
    },
    body: formData,
  })

  if (!response.ok)
    throw new Error('Download failed')

  const disposition = response.headers.get('Content-Disposition')
  let filename = `${pluginAuthor}-${pluginName}_${pluginVersion}-offline.difypkg`
  if (disposition && disposition.includes('filename=')) {
    const matches = /filename="?([^"]+)"?/.exec(disposition)
    if (matches?.[1])
      filename = matches[1]
  }

  const blob = await response.blob()
  const downloadUrl = window.URL.createObjectURL(blob)

  return { downloadUrl, filename }
}
