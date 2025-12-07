"use client"
import Image from 'next/image'
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const basePath = '' // Removed basePath for local development with API routes

const ITEMS_PER_PAGE = 8

// Default points range (will be updated when rewards are loaded)
let MIN_POINTS = 50
let MAX_POINTS = 500000

// Banner images for carousel
const bannerImages = [
  { src: '/Time2Claim.png', alt: 'Time2Claim banner' },
  { src: '/iphone17promax.png', alt: 'iPhone 17 Pro Max' },
  { src: '/bmw.png', alt: 'BMW M2 2025' },
]

export default function Home() {
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReward, setSelectedReward] = useState<null | any>(null)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [tierFilter, setTierFilter] = useState<string[]>([])
  const [pointsRange, setPointsRange] = useState<[number, number]>([MIN_POINTS, MAX_POINTS])
  const [sortOrder, setSortOrder] = useState<'high-low' | 'low-high'>('high-low')
  const [selectedVariants, setSelectedVariants] = useState<Record<number, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [claimId, setClaimId] = useState('')
  const [showClaimsChecker, setShowClaimsChecker] = useState(false)
  const [checkClaimId, setCheckClaimId] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [claimStatus, setClaimStatus] = useState<{status: string, color: string, message: string} | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [userPoints, setUserPoints] = useState(500000) // User's current points

  // Fetch rewards from database
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch('/api/rewards')
        const data = await response.json()
        setRewards(data)
        
        // Update points range based on fetched rewards
        if (data.length > 0) {
          const points = data.map((r: any) => r.points)
          MIN_POINTS = Math.min(...points)
          MAX_POINTS = Math.max(...points)
          setPointsRange([MIN_POINTS, MAX_POINTS])
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching rewards:', error)
        setLoading(false)
      }
    }

    fetchRewards()
  }, [])

  // Reset gallery image and variant when popup opens
  useEffect(() => {
    if (selectedReward) {
      setSelectedGalleryImage(0)
      const firstVariant = (selectedReward as any).variants?.options?.[0] || ''
      setSelectedVariant(firstVariant)
    }
  }, [selectedReward])

  // Tier system based on points
  const getTier = (points: number, itemName: string) => {
    // Black Diamond: Luxury Cars (BMW, Mercedes, etc.) - 200k+ points
    if (points >= 200000 || itemName.toLowerCase().includes('bmw') || itemName.toLowerCase().includes('mercedes') || itemName.toLowerCase().includes('porsche') || itemName.toLowerCase().includes('ferrari')) {
      return 'black-diamond'
    }
    // Diamond: Rolex, high-end watches - 75k-200k points
    if (points >= 75000 || itemName.toLowerCase().includes('rolex') || itemName.toLowerCase().includes('watch')) {
      return 'diamond'
    }
    // Gold: iPhone, MacBook - 25k-75k points
    if (points >= 25000 || itemName.toLowerCase().includes('iphone') || itemName.toLowerCase().includes('macbook')) {
      return 'gold'
    }
    // Silver: Mid-range gadgets, GCash - 500-25k points
    if (points >= 500) {
      return 'silver'
    }
    // Bronze: Smaller prizes - under 500 points
    return 'bronze'
  }

  const sortedRewards = useMemo(() => {
    let filtered = [...rewards]
    
    // Filter by search query (automatic, searches name and category)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((r: any) => 
        r.name.toLowerCase().includes(query) || 
        r.category.toLowerCase().includes(query)
      )
    }
    
    // Filter by category (additive - if any selected, filter to those)
    if (categoryFilter.length > 0) {
      filtered = filtered.filter((r: any) => categoryFilter.includes(r.category))
    }
    
    // Filter by points range
    filtered = filtered.filter((r: any) => r.points >= pointsRange[0] && r.points <= pointsRange[1])
    
    // Filter by tier (additive - if any selected, filter to those)
    if (tierFilter.length > 0) {
      filtered = filtered.filter((r: any) => tierFilter.includes(getTier(r.points, r.name)))
    }
    
    // Sort by points
    if (sortOrder === 'high-low') {
      return filtered.sort((a, b) => b.points - a.points)
    } else if (sortOrder === 'low-high') {
      return filtered.sort((a, b) => a.points - b.points)
    }
    
    return filtered
  }, [rewards, searchQuery, categoryFilter, tierFilter, pointsRange, sortOrder])

  const getTierStyles = (tier: string) => {
    switch (tier) {
      case 'black-diamond':
        return {
          borderColor: '#a78bfa',
          animation: 'blackDiamondGlow 2s ease-in-out infinite',
          className: 'tier-black-diamond',
          textColor: 'text-white',
          pointsColor: 'text-yellow-400',
          buttonBg: 'bg-[#1e3a8a] hover:bg-[#1e3a8a]/80 text-white font-bold uppercase tracking-wider shadow-lg',
          tierLabel: 'BLACK DIAMOND',
          tierLabelBg: 'bg-gradient-to-r from-purple-900 to-black',
          cardBg: 'bg-[#1a1f3a]', // Dark navy blue background
          imageOverlay: 'bg-gradient-to-br from-transparent via-purple-900/20 to-blue-900/30' // Cosmic overlay
        }
      case 'diamond':
        return {
          borderColor: '#a78bfa',
          animation: 'diamondSparkle 2s ease-in-out infinite',
          className: 'tier-diamond',
          textColor: 'text-white',
          pointsColor: 'text-yellow-400',
          buttonBg: 'bg-[#7c3aed] hover:bg-[#7c3aed]/80 text-white font-bold uppercase tracking-wider shadow-lg border-2 border-purple-400',
          tierLabel: '💠 DIAMOND',
          tierLabelBg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
          cardBg: 'bg-gradient-to-br from-[#3d2463] via-[#2d1850] to-[#1f0f3a]', // Deep purple cosmic gradient background
          imageOverlay: 'bg-gradient-to-br from-purple-400/20 via-violet-500/30 to-blue-500/20' // Cosmic light rays overlay
        }
      case 'gold':
        return {
          borderColor: '#ffd700',
          animation: 'goldGlow 2s ease-in-out infinite',
          className: 'tier-gold',
          textColor: 'text-white',
          pointsColor: 'text-yellow-400',
          buttonBg: 'bg-[#7c3aed] hover:bg-[#7c3aed]/80 text-white font-bold uppercase tracking-wider shadow-lg',
          tierLabel: 'GOLD',
          tierLabelBg: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
        }
      case 'silver':
        return {
          borderColor: '#c0c0c0',
          animation: 'silverShine 3s ease-in-out infinite',
          className: 'tier-silver',
          textColor: 'text-gray-800',
          pointsColor: 'text-gray-700',
          buttonBg: 'bg-gray-700 hover:bg-gray-800 text-white',
          tierLabel: 'SILVER',
          tierLabelBg: 'bg-gradient-to-r from-gray-400 to-gray-500'
        }
      default: // bronze
        return {
          borderColor: '#cd7f32',
          animation: 'bronzeMatte 3s ease-in-out infinite',
          className: 'tier-bronze',
          textColor: 'text-yellow-100',
          pointsColor: 'text-yellow-200',
          buttonBg: 'bg-yellow-900 hover:bg-yellow-800 text-yellow-100',
          tierLabel: 'BRONZE',
          tierLabelBg: 'bg-gradient-to-r from-amber-700 to-amber-800'
        }
    }
  }

  // Reset to page 1 when filter changes
  const totalPages = Math.ceil(sortedRewards.length / ITEMS_PER_PAGE)
  const paginatedRewards = sortedRewards.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Toggle category filter
  const toggleCategoryFilter = (category: string) => {
    setCategoryFilter(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
    setCurrentPage(1)
  }

  // Toggle tier filter
  const toggleTierFilter = (tier: string) => {
    setTierFilter(prev => 
      prev.includes(tier) 
        ? prev.filter(t => t !== tier)
        : [...prev, tier]
    )
    setCurrentPage(1)
  }

  // Clear all filters
  const clearAllFilters = () => {
    setCategoryFilter([])
    setTierFilter([])
    setPointsRange([MIN_POINTS, MAX_POINTS])
    setCurrentPage(1)
  }

  // Count active filters
  const activeFilterCount = categoryFilter.length + tierFilter.length + 
    (pointsRange[0] !== MIN_POINTS || pointsRange[1] !== MAX_POINTS ? 1 : 0)

  if (typeof window !== 'undefined') {
    (window as any).popupDebug = () => setSelectedReward(rewards[0])
  }

  // Categories and tiers for filters
  const categories = ['Accessory', 'Car', 'E-wallet', 'Gadget', 'Merch']
  const tiers = [
    { id: 'black-diamond', label: 'Black Diamond', color: 'from-purple-900 to-black' },
    { id: 'diamond', label: 'Diamond', color: 'from-indigo-600 to-purple-600' },
    { id: 'gold', label: 'Gold', color: 'from-yellow-500 to-yellow-600' },
    { id: 'silver', label: 'Silver', color: 'from-gray-400 to-gray-500' },
    { id: 'bronze', label: 'Bronze', color: 'from-amber-700 to-amber-800' },
  ]

  
  // Mobile filter drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  return (
    <div className="min-h-screen text-white flex flex-col overflow-visible relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/Rectangle 22.png')" }}
      />
      {/* Header - Matching new design */}
      <header className="w-full px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg relative z-10" style={{ background: 'linear-gradient(180deg, rgba(13, 31, 53, 0.95) 0%, rgba(10, 22, 40, 0.9) 100%)', borderBottom: '1px solid rgba(30, 58, 77, 0.3)' }}>
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img src="/Time2Claim 1.png" alt="Time2Claim Logo" className="w-32 sm:w-[180px]" />
        </div>
        
        {/* Right side - Welcome message and Earn Points button */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Welcome message with user icon */}
          <div className="hidden sm:flex items-center gap-2 text-gray-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Welcome, Warren!</span>
          </div>
          
          {/* Earn More Points button */}
          <button 
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black rounded-lg font-semibold text-sm transition-all shadow-lg"
            onClick={() => setShowClaimsChecker(true)}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="hidden sm:inline">Earn More Points</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Mobile filter button */}
          <button 
            className="md:hidden px-3 py-2 bg-yellow-500 text-black rounded-lg font-semibold text-sm"
            onClick={() => setMobileFiltersOpen(true)}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </header>
      {/* Hero Banner - Static at top */}
      <div className="w-full relative z-10">
        <img 
          src="/claim-reward-banner.png" 
          alt="Claim Your Reward Today - Time2Claim" 
          className="w-full h-auto object-cover"
        />
      </div>
      {/* 3D Perspective Carousel */}
      <div className="w-full py-8 sm:py-12 overflow-hidden relative z-10" style={{ perspective: '1200px' }}>
        <div className="relative h-64 sm:h-80 md:h-96 flex items-center justify-center">
          {/* Render all reward cards with 3D positioning */}
          {sortedRewards.slice(0, 5).map((reward, index) => {
            const position = index - currentSlide
            const isCenter = position === 0
            const absPosition = Math.abs(position)
            
            // Calculate transforms for 3D carousel effect
            const translateX = position * 280 // Horizontal spacing
            const translateZ = isCenter ? 0 : -150 - (absPosition - 1) * 50 // Depth
            const scale = isCenter ? 1 : 0.85 - (absPosition - 1) * 0.1 // Scale
            const opacity = absPosition > 2 ? 0 : isCenter ? 1 : 0.6 // Visibility
            const rotateY = position * -15 // Slight rotation
            
            const tierStyles = getTierStyles(getTier(reward.points, reward.name))
            
            return (
              <div
                key={reward.id}
                className="absolute transition-all duration-500 ease-out cursor-pointer"
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  opacity: opacity,
                  zIndex: isCenter ? 10 : 5 - absPosition,
                  pointerEvents: absPosition > 2 ? 'none' : 'auto'
                }}
                onClick={() => setCurrentSlide(index)}
              >
                {/* Card */}
                <div 
                  className="w-56 h-80 sm:w-64 sm:h-96 rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    border: `3px solid ${tierStyles.borderColor}`,
                    animation: isCenter ? tierStyles.animation : 'none'
                  }}
                >
                  {/* Image Container */}
                  <div className="relative h-3/4 bg-gradient-to-br from-gray-200 to-gray-300">
                    <img
                      src={reward.image_url || '/placeholder.png'}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Info Footer with Blue Gradient - Matching reference */}
                  <div className="h-1/4 bg-gradient-to-br from-[#0099ff] via-[#0066cc] to-[#0044aa] p-4 flex flex-col justify-center relative overflow-hidden">
                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <h3 className="text-white font-bold text-sm sm:text-base truncate relative z-10">
                      {reward.name}
                    </h3>
                    <p className="text-cyan-200 text-xs sm:text-sm flex items-center gap-1 relative z-10">
                      <img src="/Pts 1.png" alt="Points" className="w-4 h-4" />
                      {reward.points.toLocaleString()} Pts
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {sortedRewards.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-yellow-400 w-8' 
                  : 'bg-gray-500 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : sortedRewards.slice(0, 5).length - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev < sortedRewards.slice(0, 5).length - 1 ? prev + 1 : 0))}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-gray-800 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-400 text-2xl">&times;</button>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="text-xs text-red-400 hover:text-red-300 underline mb-4">
                Clear All ({activeFilterCount})
              </button>
            )}
            {/* Mobile Points Range */}
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Points Range</h4>
              <div className="flex gap-2">
                <input type="number" value={pointsRange[0]} onChange={(e) => { const val = Number(e.target.value); if (val >= MIN_POINTS && val <= pointsRange[1]) { setPointsRange([val, pointsRange[1]]); setCurrentPage(1) }}} className="w-1/2 px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-white" />
                <input type="number" value={pointsRange[1]} onChange={(e) => { const val = Number(e.target.value); if (val <= MAX_POINTS && val >= pointsRange[0]) { setPointsRange([pointsRange[0], val]); setCurrentPage(1) }}} className="w-1/2 px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-white" />
              </div>
            </div>
            {/* Mobile Category Filter */}
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</h4>
              <div className="space-y-1">
                {categories.map(cat => (
                  <label key={cat} className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all ${categoryFilter.includes(cat) ? 'bg-yellow-500/10 border border-yellow-500/30' : 'hover:bg-gray-700/50'}`}>
                    <input type="checkbox" checked={categoryFilter.includes(cat)} onChange={() => toggleCategoryFilter(cat)} className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-yellow-500" />
                    <span className={`text-sm ${categoryFilter.includes(cat) ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Mobile Tier Filter */}
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Prestige Tier</h4>
              <div className="space-y-1">
                {tiers.map(tier => (
                  <label key={tier.id} className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all ${tierFilter.includes(tier.id) ? 'bg-yellow-500/10 border border-yellow-500/30' : 'hover:bg-gray-700/50'}`}>
                    <input type="checkbox" checked={tierFilter.includes(tier.id)} onChange={() => toggleTierFilter(tier.id)} className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-yellow-500" />
                    <span className={`text-sm ${tierFilter.includes(tier.id) ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>{tier.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={() => setMobileFiltersOpen(false)} className="w-full bg-yellow-500 text-black py-2 rounded-lg font-bold mt-4">Apply Filters</button>
          </div>
        </div>
      )}

      <div className="flex flex-1 w-full overflow-visible relative z-10">
        {/* Sidebar - Active Filters (Desktop) */}
        <aside className="hidden md:flex flex-col w-72 rounded-xl mx-8 my-4 p-6 shadow-lg border border-[#1e3a4d]/50" style={{ background: 'linear-gradient(180deg, #0d1f2d 0%, #0a1a28 50%, #071420 100%)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Active Filters</h3>
            {activeFilterCount > 0 && (
              <button 
                onClick={clearAllFilters}
                className="text-xs text-red-400 hover:text-red-300 underline"
              >
                Clear All ({activeFilterCount})
              </button>
            )}
          </div>
          
          {/* Points Range Slider */}
          <div className="mb-8 bg-[#0a1822]/60 rounded-xl p-4 border border-[#1e3a4d]/30">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <img src="/Pts 1.png" alt="Points" className="w-5 h-5" /> Points Range
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{pointsRange[0].toLocaleString()}</span>
                <span>{pointsRange[1].toLocaleString()}</span>
              </div>
              <div className="relative h-2">
                {/* Track background */}
                <div className="absolute inset-0 bg-[#1a2d3d] rounded-full"></div>
                {/* Active track */}
                <div 
                  className="absolute h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                  style={{
                    left: `${((pointsRange[0] - MIN_POINTS) / (MAX_POINTS - MIN_POINTS)) * 100}%`,
                    right: `${100 - ((pointsRange[1] - MIN_POINTS) / (MAX_POINTS - MIN_POINTS)) * 100}%`
                  }}
                ></div>
                <input
                  type="range"
                  min={MIN_POINTS}
                  max={MAX_POINTS}
                  value={pointsRange[0]}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val <= pointsRange[1]) {
                      setPointsRange([val, pointsRange[1]])
                      setCurrentPage(1)
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-yellow-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-yellow-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-yellow-500 [&::-moz-range-thumb]:cursor-pointer"
                  style={{ zIndex: 2 }}
                />
                <input
                  type="range"
                  min={MIN_POINTS}
                  max={MAX_POINTS}
                  value={pointsRange[1]}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val >= pointsRange[0]) {
                      setPointsRange([pointsRange[0], val])
                      setCurrentPage(1)
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-300 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-cyan-300 [&::-moz-range-thumb]:cursor-pointer"
                  style={{ zIndex: 3 }}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <input
                  type="number"
                  value={pointsRange[0]}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val >= MIN_POINTS && val <= pointsRange[1]) {
                      setPointsRange([val, pointsRange[1]])
                      setCurrentPage(1)
                    }
                  }}
                  className="w-1/2 px-3 py-2 text-sm bg-[#0a1822] border border-[#1e3a4d] rounded-lg text-white text-center focus:outline-none focus:border-yellow-500"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={pointsRange[1]}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val <= MAX_POINTS && val >= pointsRange[0]) {
                      setPointsRange([pointsRange[0], val])
                      setCurrentPage(1)
                    }
                  }}
                  className="w-1/2 px-3 py-2 text-sm bg-[#0a1822] border border-[#1e3a4d] rounded-lg text-white text-center focus:outline-none focus:border-yellow-500"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-4">Category</h4>
            <div className="space-y-1">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer py-2 transition-all hover:text-white">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${categoryFilter.includes(cat) ? 'bg-yellow-500 border-yellow-500' : 'bg-[#1a2d3d] border-[#2a4050]'}`}>
                    {categoryFilter.includes(cat) && (
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={categoryFilter.includes(cat)}
                    onChange={() => toggleCategoryFilter(cat)}
                    className="hidden"
                  />
                  <span className={`text-sm ${categoryFilter.includes(cat) ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Prestige Tier Filter */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-4">Prestige Tear</h4>
            <div className="space-y-1">
              {tiers.map(tier => (
                <label key={tier.id} className="flex items-center gap-3 cursor-pointer py-2 transition-all hover:text-white">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${tierFilter.includes(tier.id) ? 'bg-yellow-500 border-yellow-500' : 'bg-[#1a2d3d] border-[#2a4050]'}`}>
                    {tierFilter.includes(tier.id) && (
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={tierFilter.includes(tier.id)}
                    onChange={() => toggleTierFilter(tier.id)}
                    className="hidden"
                  />
                  <span className={`text-sm ${tierFilter.includes(tier.id) ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {tier.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-3 sm:px-4 md:px-8 py-4 overflow-visible">
          <div className="w-full max-w-7xl flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center mb-4 sm:mb-6 px-1">
            {/* Search Bar with Icon - Matching reference design */}
            <div className="relative w-full sm:w-64 md:w-80 lg:w-[400px]">
              {/* Search Icon */}
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              <input 
                type="text" 
                placeholder="Search Rewards..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-300 placeholder-gray-500 bg-[#1a2d3d] border border-[#2a3d4d] focus:outline-none focus:border-[#3a4d5d] focus:bg-[#243542] transition-all text-sm" 
              />
            </div>
            {/* User Points Badge - Positioned on far right */}
            <div className="flex items-center gap-2 bg-[#2a3d4d] rounded-full px-4 py-3 border border-[#3a4d5d] sm:ml-auto">
              <img src="/Pts 1.png" alt="Points" className="w-6 h-6" />
              <span className="text-white font-bold text-base">{userPoints.toLocaleString()} Pts.</span>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center w-full py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 text-lg">Loading rewards...</p>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full max-w-7xl px-1 overflow-visible pt-8">
          {paginatedRewards.map((item) => {
            const availableStock = item.quantity || 0
            const isLowStock = availableStock <= 10 && availableStock >= 2
            const isLastOne = availableStock === 1
            const isOutOfStock = availableStock === 0
            const tier = getTier(item.points, item.name)
            const tierStyles = getTierStyles(tier)
            
            return (
            <div key={item.id} className={`relative hover:scale-105 transition-all duration-200 h-full group ${(isLowStock || isLastOne) ? 'z-10 hover:z-30' : 'z-0 hover:z-30'} ${isOutOfStock ? 'cursor-not-allowed' : ''}`} style={{ overflow: 'visible' }}>
              {/* Low Stock Banner (2-10 items) - Plain overlay */}
              {isLowStock && (
                      <div className="absolute top-0 -right-7 bg-orange-500 text-white text-center py-1 px-3 rounded-xl font-bold text-xs shadow-lg z-10 group-hover:z-50 pointer-events-none select-none"
                      style={{ transform: 'rotate(20deg)' }}>
                        Only {availableStock} Left!
                      </div>
              )}
              
              {/* Last One Banner (1 item) - Animated overlay */}
              {isLastOne && (
                      <div className="absolute top-0 -right-5 bg-red-600 text-white text-center py-1 px-3 rounded-xl font-bold text-sm animate-banner-glow z-10 group-hover:z-50 pointer-events-none select-none"
                      style={{ transform: 'rotate(20deg)' }}>
                        Last One!
                      </div>
              )}
              
              {/* Out of Stock Overlay (0 items) - Full card cover */}
              {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center z-50 select-none">
                        <div className="text-white font-extrabold text-2xl text-center">
                          OUT OF<br />STOCK
                        </div>
                      </div>
              )}
              
              <div className="transition-all duration-200 h-full">
              <div 
                className={`flex flex-col items-center rounded-[10px] shadow-2xl border-2 transition-all duration-200 ${tierStyles.className} ${
                  isLastOne 
                    ? 'border-red-500' 
                    : ''
                } ${tier === 'black-diamond' ? tierStyles.cardBg : tier === 'diamond' ? 'bg-gradient-to-br from-[#3d2463] via-[#2d1850] to-[#1f0f3a]' : 'bg-white'}`} 
                style={{
                  width: '295px',
                  height: '439px',
                  borderColor: isLastOne ? '#ef4444' : tierStyles.borderColor,
                  animation: isLastOne ? 'pulseGlow 1.5s ease-in-out infinite' : tierStyles.animation,
                  ...(isLastOne && {
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.7), 0 0 40px rgba(239, 68, 68, 0.4)',
                  })
                }}
              >
              {/* Image - fills most of card */}
              <div className={`w-full flex-1 rounded-t-[10px] px-3 py-3 flex items-center justify-center overflow-hidden relative ${
                tier === 'black-diamond' ? 'bg-transparent' :
                tier === 'diamond' ? 'bg-transparent' :
                tier === 'gold' ? 'bg-transparent' :
                tier === 'silver' ? 'bg-transparent' :
                'bg-transparent'
              }`}>
                <img 
                  src={(item as any).image || `https://via.placeholder.com/295x300/333333/FFFFFF?text=${encodeURIComponent(item.name)}`}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-[10px]"
                />
                {/* Cosmic overlay for Black Diamond and Diamond tiers */}
                {(tier === 'black-diamond' || tier === 'diamond') && (
                  <div className={`absolute inset-0 ${tierStyles.imageOverlay} rounded-[10px] pointer-events-none`}></div>
                )}
              </div>
              
              <div className={`px-3 py-3 w-full flex flex-col gap-1 ${tier === 'diamond' ? 'bg-transparent' : ''}`}>
              {/* Reward Name - Left aligned */}
              <div className={`font-extrabold text-lg text-left w-full ${tierStyles.textColor}`}>{item.name}</div>
              
              {/* Points with token icon - Left aligned */}
              <div className={`mb-0 text-left w-full flex items-center gap-2 font-medium ${tierStyles.textColor}`}>
                <img src="/Pts 1.png" alt="Points" className="w-5 h-5" />
                <span className={`${tierStyles.pointsColor} font-bold text-lg`}>{item.points.toLocaleString()}</span>
              </div>
              
              {/* Claim Button */}
              <motion.button
                type="button"
                className={`px-6 py-2.5 rounded-lg font-bold shadow transition w-full mt-auto text-sm uppercase tracking-wide ${
                  isOutOfStock
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : isLastOne && tier !== 'black-diamond' && tier !== 'diamond' && tier !== 'gold'
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' 
                    : tierStyles.buttonBg
                }`}
                onClick={() => !isOutOfStock && setSelectedReward(item)}
                disabled={isOutOfStock}
                whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
                whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {isOutOfStock ? 'OUT OF STOCK' : 'CLAIM NOW'}
              </motion.button>
              </div>
              </div>
              </div>
            </div>
            )
          })}
        </div>
          )}
        
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8 mb-4 flex-wrap px-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-2 sm:px-4 py-2 rounded-lg font-bold transition text-xs sm:text-base ${
                currentPage === 1 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-yellow-600 text-black hover:bg-yellow-500'
              }`}
            >
              Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // On mobile, show limited page numbers
              const showPage = totalPages <= 5 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
              if (!showPage) {
                if (page === 2 || page === totalPages - 1) return <span key={page} className="text-gray-500 px-1">...</span>
                return null
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold transition text-xs sm:text-base ${
                    currentPage === page 
                      ? 'bg-yellow-400 text-black' 
                      : 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-4 py-2 rounded-lg font-bold transition text-xs sm:text-base ${
                currentPage === totalPages 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-yellow-600 text-black hover:bg-yellow-500'
              }`}
            >
              Next
            </button>
          </div>
        )}
        
        {/* Page Info */}
        {!loading && totalPages > 1 && (
          <div className="text-gray-400 text-sm text-center mb-4">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, sortedRewards.length)} of {sortedRewards.length} rewards
          </div>
        )}
        
        {/* Claims Checker Modal */}
        {showClaimsChecker && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-80 p-4 animate-fadeIn" onClick={() => {
            setShowClaimsChecker(false);
            setCheckClaimId('');
            setClaimStatus(null);
            setIsChecking(false);
          }}>
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full border-2 border-blue-500 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold"
                onClick={() => {
                  setShowClaimsChecker(false);
                  setCheckClaimId('');
                  setClaimStatus(null);
                  setIsChecking(false);
                }}
              >
                &times;
              </button>
              
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold text-blue-400 mb-2">Claims Checker</h2>
                <p className="text-gray-300 text-sm">Please enter your Request ID so you can see the status of your request</p>
              </div>
              
              {/* Input Field with Loading Animation */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={checkClaimId}
                    onChange={(e) => setCheckClaimId(e.target.value.toUpperCase())}
                    placeholder="Enter Request ID (e.g., CLM-XY7K4M9B2)"
                    className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                    disabled={isChecking}
                  />
                  {isChecking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Check Claim Button */}
              <button
                onClick={async () => {
                  if (!checkClaimId.trim()) return;
                  setIsChecking(true);
                  setClaimStatus(null);
                  
                  try {
                    const response = await fetch(`/api/claims?claimId=${checkClaimId}`);
                    const data = await response.json();
                    
                    if (response.ok) {
                      // Capitalize first letter for display
                      const displayStatus = data.status.charAt(0).toUpperCase() + data.status.slice(1);
                      
                      const statusColors: Record<string, string> = {
                        'pending': 'yellow',
                        'processing': 'blue',
                        'approved': 'green',
                        'shipped': 'purple',
                        'delivered': 'emerald',
                        'rejected': 'red'
                      };
                      
                      const statusMessages: Record<string, string> = {
                        'pending': 'Your claim is being reviewed by our team.',
                        'processing': 'Your reward is currently being processed.',
                        'approved': 'Your claim has been approved! Preparing for shipment.',
                        'shipped': 'Your reward has been shipped! Track your delivery.',
                        'delivered': 'Your reward has been delivered successfully!',
                        'rejected': 'Your claim was rejected. Please contact support for details.'
                      };
                      
                      setClaimStatus({
                        status: displayStatus,
                        color: statusColors[data.status.toLowerCase()] || 'gray',
                        message: statusMessages[data.status.toLowerCase()] || 'Status unknown.'
                      });
                    } else {
                      setClaimStatus({
                        status: 'Not Found',
                        color: 'red',
                        message: data.error || 'Claim not found. Please check your Request ID.'
                      });
                    }
                  } catch (error) {
                    console.error('Error checking claim:', error);
                    setClaimStatus({
                      status: 'Error',
                      color: 'red',
                      message: 'Failed to check claim status. Please try again.'
                    });
                  } finally {
                    setIsChecking(false);
                  }
                }}
                disabled={!checkClaimId.trim() || isChecking}
                className={`w-full py-3 rounded-lg font-bold text-lg transition shadow-lg ${
                  !checkClaimId.trim() || isChecking
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isChecking ? 'Checking...' : 'Check Claim'}
              </button>
              
              {/* Result Field */}
              {claimStatus && (
                <div className={`mt-6 p-4 rounded-lg border-2 animate-scaleIn bg-${claimStatus.color}-900/30 border-${claimStatus.color}-500`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full bg-${claimStatus.color}-500 animate-pulse`}></div>
                    <h3 className={`text-xl font-bold text-${claimStatus.color}-400`}>
                      Status: {claimStatus.status}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm">{claimStatus.message}</p>
                  <p className="text-gray-500 text-xs mt-2">Request ID: {checkClaimId}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Modal */}
        <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-yellow-500"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              {/* Success Message */}
              <h2 className="text-2xl font-extrabold text-yellow-400 mb-4">
                Claim Request Received!
              </h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                We have received your claim request.
              </p>
              
              {/* Claim ID */}
              <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Your Claim ID:</p>
                <p className="text-xl font-bold text-yellow-300 tracking-wider">{claimId}</p>
              </div>
              
              <p className="text-gray-400 text-sm mb-6">
                Please wait patiently for it to be processed. Thank you!
              </p>
              
              <p className="text-yellow-500 text-sm font-semibold mb-6">
                You can check it in our claims status checker.
              </p>
              
              {/* Close Button */}
              <motion.button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSelectedReward(null);
                }}
                className="w-full bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 transition shadow-lg"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Got it!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Popup Card */}
        <AnimatePresence>
        {selectedReward && !showSuccessModal && (
          <motion.div 
            id="popup-card" 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 p-4" 
            onClick={() => setSelectedReward(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="relative rounded-2xl shadow-2xl p-6 max-w-3xl w-full text-white max-h-[90vh] overflow-y-auto overflow-x-hidden" 
              style={{
                background: 'linear-gradient(90deg, #0A1F30 0%, #0B3151 100%)',
              }}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold z-10" onClick={() => setSelectedReward(null)}>&times;</button>
              
              {/* First Row - 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Column 1: Image and Gallery */}
                <div className="flex flex-col gap-3">
                  {/* Main Display Image */}
                  <div className="aspect-[658/403] bg-[#1a2a3a] rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={
                        (selectedReward as any).galleries && selectedVariant && (selectedReward as any).galleries[selectedVariant]
                          ? (selectedReward as any).galleries[selectedVariant][selectedGalleryImage]
                          : ((selectedReward as any).image || `https://via.placeholder.com/658x403/1a2a3a/666666?text=${encodeURIComponent(selectedReward.name)}`)
                      }
                      alt={`${selectedReward.name} - ${selectedVariant} - Image ${selectedGalleryImage + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Gallery Thumbnails */}
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <div 
                        key={idx} 
                        className={`aspect-[150/100] bg-[#1a2a3a] rounded-lg cursor-pointer transition flex items-center justify-center overflow-hidden border ${
                          selectedGalleryImage === idx 
                            ? 'border-white' 
                            : 'border-transparent hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedGalleryImage(idx)}
                      >
                        <img 
                          src={
                            (selectedReward as any).galleries && selectedVariant && (selectedReward as any).galleries[selectedVariant]
                              ? (selectedReward as any).galleries[selectedVariant][idx]
                              : ((selectedReward as any).image || `https://via.placeholder.com/150x100/1a2a3a/666666?text=${idx + 1}`)
                          }
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Reward Details */}
                <div className="flex flex-col gap-1">
                  {/* Reward Name */}
                  <h2 className="font-bold text-2xl text-white">{selectedReward.name}</h2>
                  
                  {/* Subtitle */}
                  <p className="text-sm text-gray-300">{selectedReward.name}</p>
                  
                  {/* Extra Detail */}
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">Premium quality reward from our exclusive collection.<br/>Limited availability.</p>
                  
                  {/* Variant Options */}
                  {(selectedReward as any).variants && (
                    <div className="mt-4">
                      <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Select {(selectedReward as any).variants.type}:
                      </label>
                      
                      {(selectedReward as any).variants.type === 'color' ? (
                        /* Colored circle buttons for color variants */
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(selectedReward as any).variants.options.map((option: string) => {
                            const colorMap: { [key: string]: string } = {
                              'Black': '#000000',
                              'White': '#FFFFFF',
                              'Red': '#FF0000',
                              'Blue': '#0000FF',
                              'Silver': '#C0C0C0',
                              'Clear': '#F0F0F0',
                              'Black Titanium': '#2C2C2C',
                              'White Titanium': '#E8E8E8',
                              'Natural Titanium': '#B8956A',
                              'Desert Titanium': '#D4A373',
                              'Alpine White': '#F5F5F5',
                              'Black Sapphire': '#1C1C1C',
                              'San Marino Blue': '#2B4F81',
                              'Green': '#22C55E',
                              'Asteroid Black': '#1A1A1A',
                              'Stardust Blue': '#3B82F6',
                              'Matte Black': '#1A1A1A',
                              'Racing Blue': '#0066CC',
                              'Matte Red': '#B22222'
                            }
                            const bgColor = colorMap[option] || '#808080'
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setSelectedVariant(option)
                                  setSelectedGalleryImage(0)
                                }}
                                className={`relative w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                                  selectedVariant === option
                                    ? 'border-yellow-400 ring-2 ring-yellow-400/50'
                                    : 'border-gray-500 hover:border-gray-300'
                                }`}
                                style={{ backgroundColor: bgColor }}
                                title={option}
                              >
                                {option === 'White' || option === 'Clear' || option.includes('White') ? (
                                  <div className="absolute inset-0 rounded-full border border-gray-400" />
                                ) : null}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        /* Text buttons for non-color variants */
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(selectedReward as any).variants.options.map((option: string) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setSelectedVariant(option)
                                setSelectedGalleryImage(0)
                              }}
                              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                                selectedVariant === option
                                  ? 'bg-yellow-500 text-black'
                                  : 'bg-[#2d3a4a] text-gray-300 hover:bg-[#3d4a5a] border border-[#4d5a6a]'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Points */}
                  <div className="flex items-center gap-2 mt-4">
                    <img src="/Pts 1.png" alt="Points" className="w-7 h-7" />
                    <span className="text-2xl font-bold text-orange-400">{selectedReward.points.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  
                  {/* Claiming Steps */}
                  <div className="bg-[#0d1a26] rounded-lg p-4 mt-4">
                    <h3 className="font-semibold text-sm text-white mb-2">Claiming Process:</h3>
                    <ol className="text-xs text-gray-400 space-y-0.5">
                      <li>1. Fill out the claim form below.</li>
                      <li>2. Wait for admin approval (24-48 hours).</li>
                      <li>3. Receive confirmation via email/SMS.</li>
                      <li>4. Claim your reward or receive delivery.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Second Row - Claim Form */}
              <div className="mt-6">
                <h3 className="font-semibold text-lg text-white mb-4">Complete Your Claim</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={async (e) => { 
                  e.preventDefault(); 
                  
                  const formData = new FormData(e.currentTarget);
                  const claimData = {
                    rewardId: selectedReward.id,
                    variantOption: selectedVariant,
                    username: formData.get('username'),
                    fullName: formData.get('fullName'),
                    phoneNumber: formData.get('phoneNumber'),
                    email: formData.get('email'),
                    deliveryAddress: formData.get('deliveryAddress'),
                    ewalletName: formData.get('ewalletName'),
                    ewalletAccount: formData.get('ewalletAccount')
                  };
                  
                  try {
                    const response = await fetch('/api/claims', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(claimData)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                      setClaimId(data.claimId);
                      setShowSuccessModal(true);
                    } else {
                      alert('Error submitting claim: ' + data.error);
                    }
                  } catch (error) {
                    console.error('Error submitting claim:', error);
                    alert('Failed to submit claim. Please try again.');
                  }
                }}>
                  {/* Common Fields */}
                  <input 
                    type="text" 
                    name="username"
                    placeholder="Username" 
                    className="border border-[#1a2a3a] rounded-lg px-4 py-3 bg-[#0d1a26] text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition" 
                    required 
                  />
                  <input 
                    type="text" 
                    name="fullName"
                    placeholder="Full Name" 
                    className="border border-[#1a2a3a] rounded-lg px-4 py-3 bg-[#0d1a26] text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition" 
                    required 
                  />
                  <input 
                    type="tel" 
                    name="phoneNumber"
                    placeholder="Phone Number" 
                    className="border border-[#1a2a3a] rounded-lg px-4 py-3 bg-[#0d1a26] text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition" 
                    required 
                  />
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email Address" 
                    className="border border-[#1a2a3a] rounded-lg px-4 py-3 bg-[#0d1a26] text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition" 
                    required 
                  />
                  
                  {/* Conditional Fields based on category */}
                  {(selectedReward as any).category === 'E-wallet' ? (
                    <>
                      <input 
                        type="text" 
                        name="ewalletName"
                        placeholder="E-wallet Name (GCash/Maya)" 
                        className="border border-[#1a2a3a] rounded-lg px-4 py-3 bg-[#0d1a26] text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition" 
                        required 
                      />
                      <input 
                        type="text" 
                        name="ewalletAccount"
                        placeholder="E-wallet Account Number" 
                        className="md:col-span-2 border border-[#1a2a3a] rounded-lg px-4 py-3 bg-[#0d1a26] text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition" 
                        required 
                      />
                    </>
                  ) : (
                    <input 
                      type="text"
                      name="deliveryAddress"
                      placeholder="Complete Delivery Address" 
                      className="md:col-span-2 border border-[#1a2a3a] rounded-lg px-4 py-3 bg-[#0d1a26] text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition" 
                      required 
                    />
                  )}
                  
                  {/* Submit Button */}
                  <div className="md:col-span-2 flex justify-center mt-4">
                    <motion.button 
                      type="submit" 
                      className="bg-gradient-to-b from-orange-400 to-orange-600 text-white px-20 py-4 rounded-xl font-bold text-lg uppercase tracking-wide shadow-lg hover:from-orange-500 hover:to-orange-700 transition"
                      whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(249, 115, 22, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      CONFIRM CLAIM
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}
