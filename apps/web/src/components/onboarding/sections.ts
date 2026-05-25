// ─────────────────────────────────────────────────────────────
// SECTIONS REGISTRY
// Single source of truth for all sections and their variants.
// Import ALL_SECTIONS anywhere you need the full list.
// Import RESOLVER for the Craft.js Editor resolver.
// ─────────────────────────────────────────────────────────────

import { HeaderDark, HeaderDarkBlock } from './variants/header/HeaderDark'
import { HeaderMinimal, HeaderMinimalBlock } from './variants/header/HeaderMinimal'
import { HeaderBold, HeaderBoldBlock } from './variants/header/HeaderBold'
import { HeroDark, HeroSplit, HeroFullwidth, HeroDarkBlock, HeroSplitBlock, HeroFullwidthBlock } from './variants/hero/HeroVariants'
import { ProductsGrid, ProductsList, ProductsMasonry, ProductsGridBlock, ProductsListBlock, ProductsMasonryBlock } from './variants/products/ProductsVariants'
import { AboutSplit, AboutCentered, AboutDark, FooterDark, FooterColumns, FooterMinimal, AboutSplitBlock, AboutCenteredBlock, AboutDarkBlock, FooterDarkBlock, FooterColumnsBlock, FooterMinimalBlock } from './variants/AboutFooterVariants'

import type { SectionDef } from './types'

export const ALL_SECTIONS: SectionDef[] = [
  {
    key: 'header',
    label: 'Header',
    variants: [HeaderDark, HeaderMinimal, HeaderBold],
  },
  {
    key: 'hero',
    label: 'Hero',
    variants: [HeroDark, HeroSplit, HeroFullwidth],
  },
  {
    key: 'products',
    label: 'Products',
    variants: [ProductsGrid, ProductsList, ProductsMasonry],
  },
  {
    key: 'about',
    label: 'About Us',
    variants: [AboutSplit, AboutCentered, AboutDark],
  },
  {
    key: 'footer',
    label: 'Footer',
    variants: [FooterDark, FooterColumns, FooterMinimal],
  },
]

// The Craft.js resolver — every block component must be here.
// Pass this to <Editor resolver={RESOLVER}> in the editor page.
export const RESOLVER = {
  // Headers
  HeaderDarkBlock,
  HeaderMinimalBlock,
  HeaderBoldBlock,
  // Heroes
  HeroDarkBlock,
  HeroSplitBlock,
  HeroFullwidthBlock,
  // Products
  ProductsGridBlock,
  ProductsListBlock,
  ProductsMasonryBlock,
  // About
  AboutSplitBlock,
  AboutCenteredBlock,
  AboutDarkBlock,
  // Footers
  FooterDarkBlock,
  FooterColumnsBlock,
  FooterMinimalBlock,
}
