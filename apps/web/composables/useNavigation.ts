import type { CmsMenu, CmsMenuItem } from '@ripple/cms'

export function useNavigation() {
  const headerMenu = useState<CmsMenu | null>('nav:header', () => null)
  const footerMenu = useState<CmsMenu | null>('nav:footer', () => null)

  async function loadHeaderMenu(menuName = 'main'): Promise<CmsMenu | null> {
    const { getMenu } = useCms()
    const menu = await getMenu(menuName)
    headerMenu.value = menu
    return menu
  }

  async function loadFooterMenu(menuName = 'footer'): Promise<CmsMenu | null> {
    const { getMenu } = useCms()
    const menu = await getMenu(menuName)
    footerMenu.value = menu
    return menu
  }

  function flattenMenu(items: CmsMenuItem[], maxDepth = 2, currentDepth = 0): CmsMenuItem[] {
    if (currentDepth >= maxDepth) return items.map((item) => ({ ...item, children: [] }))
    return items.map((item) => ({
      ...item,
      children: flattenMenu(item.children, maxDepth, currentDepth + 1)
    }))
  }

  const headerItems = computed(() => {
    if (!headerMenu.value) return []
    return flattenMenu(headerMenu.value.items)
  })

  const footerItems = computed(() => {
    if (!footerMenu.value) return []
    return flattenMenu(footerMenu.value.items)
  })

  return {
    headerMenu,
    footerMenu,
    headerItems,
    footerItems,
    loadHeaderMenu,
    loadFooterMenu,
    flattenMenu
  }
}
