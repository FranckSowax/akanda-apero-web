'use client'

import { useEffect, useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'

export function HomePage() {
  const { products, getFeaturedProducts } = useProducts()
  const { categories, getTopCategories } = useCategories()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [topCategories, setTopCategories] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, topCats] = await Promise.all([
          getFeaturedProducts(),
          getTopCategories(5)
        ])
        setFeaturedProducts(featured)
        setTopCategories(topCats)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }

    loadData()
  }, [])

  return {
    featuredProducts,
    topCategories
  }
}
