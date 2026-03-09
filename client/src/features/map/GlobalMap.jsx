import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import {
  US_CITIES, SHIPPING_CHOKEPOINTS, MILITARY_BASES,
  NUCLEAR_FACILITIES, UNDERSEA_CABLES, CYBER_REGIONS
} from '@config/regions.js'
import { MapFeedService } from './mapFeedService'
import { useDynamicRegions } from '@hooks/useDynamicRegions'
import { useI18n } from '@context/I18nContext'
import HotspotModal from './HotspotModal'
import TickerStrip from '@features/markets/TickerStrip'
import './GlobalMap.css'

const GlobalMap = () => {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const rotationRef = useRef([0, 0]) // Ref to track rotation for drag callbacks
  const { t, locale } = useI18n()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mapView, setMapView] = useState('global') // 'global' or 'us'
  const [worldData, setWorldData] = useState(null)
  const [usData, setUsData] = useState(null)
  const [selectedHotspot, setSelectedHotspot] = useState(null)
  const [newsLoading, setNewsLoading] = useState(false)
  const isDraggingRef = useRef(false) // Ref so D3 closures always read the latest value

  // Use dynamic regions hook
  const { hotspots, intelHotspots, usHotspots, conflictZones, lastUpdated } = useDynamicRegions()

  // Calculate quick stats
  const activeConflicts = conflictZones ? conflictZones.length : 0
  const totalIntel = (intelHotspots ? intelHotspots.length : 0) + (hotspots ? Object.keys(hotspots).length : 0)
  const alertLevel = activeConflicts > 3 ? 'high' : activeConflicts > 0 ? 'elevated' : 'moderate'

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1)
  const [translation, setTranslation] = useState([0, 0])
  const [rotation, setRotation] = useState([0, 0]) // [longitude, latitude] rotation for globe

  // Auto-rotation state
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [isUserInteracting, setIsUserInteracting] = useState(false)

  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState({
    hotspots: false,
    intelHotspots: true,
    shippingChokepoints: false,
    conflictZones: false,
    militaryBases: false,
    nuclearFacilities: false,
    underseaCables: false,
    cyberRegions: false,
    usCities: false
  })

  useEffect(() => {
    loadMapData()
  }, [])

  // Update layer visibility based on map view
  useEffect(() => {
    setLayerVisibility(prev => ({
      ...prev,
      hotspots: mapView === 'us',
      usCities: mapView === 'us'
    }))
  }, [mapView])

  // Auto-rotation effect - slow ambient spin when idle
  useEffect(() => {
    if (!isAutoRotating || isUserInteracting || mapView !== 'global' || zoomLevel > 2) {
      return
    }

    const rotationSpeed = 0.15 // degrees per frame
    const interval = setInterval(() => {
      setRotation(prev => {
        const newRotation = [prev[0] + rotationSpeed, prev[1]]
        rotationRef.current = newRotation
        return newRotation
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isAutoRotating, isUserInteracting, mapView, zoomLevel])

  useEffect(() => {
    try {
      if (mapView === 'global' && worldData && worldData.objects && worldData.objects.countries) {
        renderMap()
      } else if (mapView === 'us' && usData && usData.objects && usData.objects.states) {
        renderMap()
      }
    } catch (error) {
      console.error('Error in map render effect:', error)
      setError(t('map.failedRender'))
    }
    // Only re-render when essential dependencies change - lastUpdated timestamp handles dynamic data updates
  }, [worldData, usData, mapView, zoomLevel, translation, rotation, layerVisibility, lastUpdated, t])

  const loadMapData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load world map topology data
      const worldResponse = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      if (!worldResponse.ok) {
        throw new Error(`Failed to fetch world map: ${worldResponse.status}`)
      }
      const world = await worldResponse.json()
      setWorldData(world)

      // Load US map topology data
      const usResponse = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      if (!usResponse.ok) {
        throw new Error(`Failed to fetch US map: ${usResponse.status}`)
      }
      const us = await usResponse.json()
      setUsData(us)

      setError(null)
    } catch (e) {
      console.error('Failed to load map:', e)
      setError(t('map.failedLoadData', { message: e.message }))
    } finally {
      setLoading(false)
    }
  }

  const renderMap = () => {
    try {
      if (!containerRef.current || !svgRef.current) return
      if (mapView === 'global' && !worldData) return
      if (mapView === 'us' && !usData) return

      // Additional validation
      if (mapView === 'global' && (!worldData.objects || !worldData.objects.countries)) {
        console.error('Invalid world data structure')
        setError(t('map.invalidData'))
        return
      }

      if (mapView === 'us' && (!usData.objects || !usData.objects.states)) {
        console.error('Invalid US data structure')
        setError(t('map.invalidData'))
        return
      }

      const container = containerRef.current
      const width = container.offsetWidth || 800
      const height = container.offsetHeight || window.innerHeight - 60 // Full height

      // Clear existing content
      d3.select(svgRef.current).selectAll('*').remove()

      const svg = d3.select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')

      // Create projection
      let projection
      const minDimension = Math.min(width, height)
      if (mapView === 'global') {
        // Dynamic projection based on zoom level
        if (zoomLevel <= 2) {
          // Use orthographic projection for spherical globe appearance when zoomed out
          projection = d3.geoOrthographic()
            .scale((minDimension / 2.2) * zoomLevel)
            .translate([width / 2, height / 2])
            .center([0, 0])
            .rotate(rotation)
        } else {
          // Use natural earth projection for flatter appearance when zoomed in
          projection = d3.geoNaturalEarth1()
            .scale((width / (2 * Math.PI)) * zoomLevel)
            .translate([width / 2 + translation[0], height / 2 + translation[1]])
            .center([180, 0])
        }
      } else {
        projection = d3.geoAlbersUsa()
          .scale(width * zoomLevel * 1.2)
          .translate([width / 2 + translation[0], height / 2 + translation[1]])
      }

      const path = d3.geoPath().projection(projection)

      // Helper: check if a point is on the visible side of the globe
      const isMarkerVisible = (lon, lat) => {
        if (mapView !== 'global' || zoomLevel > 2) return true
        const center = [-rotation[0], -rotation[1]]
        return d3.geoDistance([lon, lat], center) < Math.PI / 2
      }

      // Background
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'var(--map-bg)')
        .style('pointer-events', 'none')

      if (mapView === 'global') {
        // Grid pattern for global
        const defs = svg.append('defs')

        // Glow filter for globe edge
        const filter = defs.append('filter')
          .attr('id', 'glow')
          .attr('x', '-50%')
          .attr('y', '-50%')
          .attr('width', '200%')
          .attr('height', '200%')

        filter.append('feGaussianBlur')
          .attr('stdDeviation', '10')
          .attr('result', 'coloredBlur')

        const merge = filter.append('feMerge')
        merge.append('feMergeNode').attr('in', 'coloredBlur')
        merge.append('feMergeNode').attr('in', 'SourceGraphic')

        // Gradient for sphere 3D depth
        const gradient = defs.append('radialGradient')
          .attr('id', 'sphereGradient')
          .attr('cx', '50%')
          .attr('cy', '50%')
          .attr('r', '50%')

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#1a202c')
          .attr('stop-opacity', 0.8)

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#0d1219')
          .attr('stop-opacity', 1)

        // Render sphere base (Ocean) with glow - this will be the drag surface
        if (zoomLevel <= 2) {
          const sphere = svg.append('path')
            .datum({ type: 'Sphere' })
            .attr('d', path)
            .attr('fill', 'url(#sphereGradient)')
            .attr('stroke', 'var(--accent)')
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.5)
            .style('filter', 'url(#glow)')
            .style('cursor', 'grab')
            .style('pointer-events', 'all')

          // Attach drag behavior to sphere
          const drag = d3.drag()
            .on('start', function (event) {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = false
              d3.select(this).style('cursor', 'grabbing')
            })
            .on('drag', function (event) {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = true
              const sensitivity = 0.5
              const currentRotation = rotationRef.current
              const newRotation = [
                currentRotation[0] + event.dx * sensitivity,
                Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
              ]
              rotationRef.current = newRotation
              setRotation(newRotation)
            })
            .on('end', function (event) {
              event.sourceEvent.stopPropagation()
              d3.select(this).style('cursor', 'grab')
              setTimeout(() => isDraggingRef.current = false, 50)
            })

          sphere.call(drag)
        }

        const smallGrid = defs.append('pattern')
          .attr('id', 'smallGrid')
          .attr('width', 20)
          .attr('height', 20)
          .attr('patternUnits', 'userSpaceOnUse')

        smallGrid.append('path')
          .attr('d', 'M 20 0 L 0 0 0 20')
          .attr('fill', 'none')
          .attr('stroke', 'var(--map-grid)')
          .attr('stroke-width', 0.5)

        const grid = defs.append('pattern')
          .attr('id', 'grid')
          .attr('width', 60)
          .attr('height', 60)
          .attr('patternUnits', 'userSpaceOnUse')

        grid.append('rect')
          .attr('width', 60)
          .attr('height', 60)
          .attr('fill', 'url(#smallGrid)')

        svg.append('rect')
          .attr('width', width)
          .attr('height', height)
          .attr('fill', 'url(#grid)')
          .attr('opacity', 0.3)

        // Graticule (lat/lon lines)
        const graticule = d3.geoGraticule().step([30, 30])
        svg.append('path')
          .datum(graticule)
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', 'var(--map-grid)')
          .attr('stroke-width', 0.5)
          .attr('opacity', 0.5)

        // Render countries
        const countries = topojson.feature(worldData, worldData.objects.countries)

        const countriesGroup = svg.append('g')
          .attr('class', 'countries')

        countriesGroup.selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('fill', 'var(--map-land)')
          .attr('stroke', 'var(--map-stroke)')
          .attr('stroke-width', 0.5)
          .style('pointer-events', 'visiblePainted')
          .call(d3.drag()
            .on('start', function (event) {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = false
            })
            .on('drag', function (event) {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = true
              const sensitivity = 0.5
              const currentRotation = rotationRef.current
              const newRotation = [
                currentRotation[0] + event.dx * sensitivity,
                Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
              ]
              rotationRef.current = newRotation
              setRotation(newRotation)
            })
            .on('end', function (event) {
              event.sourceEvent.stopPropagation()
              setTimeout(() => isDraggingRef.current = false, 50)
            })
          )
      }

      // Note: Sphere was rendered earlier for ocean visual. 
      // Drag is handled by individual elements (sphere, countries, hotspots)

      if (mapView === 'us') {
        // Render US states
        const states = topojson.feature(usData, usData.objects.states)

        svg.append('g')
          .attr('class', 'states')
          .selectAll('path')
          .data(states.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('fill', 'var(--map-land)')
          .attr('stroke', 'var(--map-stroke)')
          .attr('stroke-width', 0.5)
          .style('pointer-events', 'none')

        // Render US cities from config
        if (layerVisibility.usCities) {
          const citiesGroup = svg.append('g').attr('class', 'us-cities')

          US_CITIES.forEach(city => {
            const projected = projection([city.lon, city.lat])
            if (!projected) return
            const [x, y] = projected
            if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) return

            const group = citiesGroup.append('g')
              .attr('class', `us-city ${city.type}`)
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            group.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({
                ...city,
                type: 'city',
                severity: city.type === 'capital' ? 'high' : city.type === 'military' ? 'elevated' : 'medium'
              })
            })

            group.call(d3.drag()
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

            group.append('circle')
              .attr('class', 'us-city-dot')
              .attr('r', city.type === 'capital' ? 6 : city.type === 'major' ? 5 : city.type === 'military' ? 5 : 4)
              .attr('fill', city.type === 'capital' ? '#ffcc00' : city.type === 'military' ? '#ff6600' : '#00ff00')

            group.append('text')
              .attr('class', 'us-city-label')
              .attr('x', 8)
              .attr('y', 4)
              .text(city.name)
          })
        }
      }

      // Add hotspots (global hotspots for global view, US hotspots for US view)
      if (layerVisibility.hotspots) {
        const hotspotsData = mapView === 'global' ? Object.values(hotspots) : usHotspots

        const hotspotsGroup = svg.append('g').attr('class', 'hotspots')

        hotspotsData.forEach(hotspot => {
          if (!isMarkerVisible(hotspot.lon, hotspot.lat)) return
          const projected = projection([hotspot.lon, hotspot.lat])
          if (!projected) return
          const [x, y] = projected

          const severity = hotspot.severity || hotspot.level
          const group = hotspotsGroup.append('g')
            .attr('class', `hotspot ${severity}`)
            .attr('transform', `translate(${x},${y})`)
            .style('cursor', 'pointer')

          group.on('click', () => {
            if (!isDraggingRef.current) handleHotspotClick(hotspot)
          })

          group.call(d3.drag()
            .on('start', () => isDraggingRef.current = false)
            .on('drag', (event) => {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = true
              const sensitivity = 0.5
              const currentRotation = rotationRef.current
              const newRotation = [
                currentRotation[0] + event.dx * sensitivity,
                Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
              ]
              rotationRef.current = newRotation
              setRotation(newRotation)
            })
            .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
          )

          // Pulsing ring
          group.append('circle')
            .attr('r', 8)
            .attr('fill', 'none')
            .attr('stroke', severity === 'high' ? '#ff3333' : severity === 'elevated' ? '#ffcc00' : '#00ff88')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8)
            .attr('class', severity === 'high' ? 'hotspot-pulse' : '')

          // Inner dot
          group.append('circle')
            .attr('r', 3)
            .attr('fill', severity === 'high' ? '#ff3333' : severity === 'elevated' ? '#ffcc00' : '#00ff88')

          // Label
          group.append('text')
            .attr('x', 12)
            .attr('y', 4)
            .attr('fill', severity === 'high' ? '#ff3333' : severity === 'elevated' ? '#ffcc00' : '#00ff88')
            .attr('font-size', '10px')
            .attr('font-weight', '600')
            .text(hotspot.name)
        })
      }

      // Add additional layers (Global Only)
      if (mapView === 'global') {
        // Shipping Chokepoints
        if (layerVisibility.shippingChokepoints) {
          const chokeGroup = svg.append('g').attr('class', 'chokepoints')
          SHIPPING_CHOKEPOINTS.forEach(point => {
            if (!isMarkerVisible(point.lon, point.lat)) return
            const projected = projection([point.lon, point.lat])
            if (!projected) return
            const [x, y] = projected
            const g = chokeGroup.append('g')
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            g.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({ ...point, type: 'chokepoint' })
            })

            g.call(d3.drag()
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

            g.append('rect')
              .attr('x', -6).attr('y', -6)
              .attr('width', 12).attr('height', 12)
              .attr('fill', '#0091ff')
              .attr('stroke', '#ffffff')
              .attr('stroke-width', 1)
          })
        }

        // Conflict Zones
        if (layerVisibility.conflictZones) {
          const conflictGroup = svg.append('g').attr('class', 'conflict-zones')
          conflictZones.forEach(zone => {
            if (!isMarkerVisible(zone.labelPos.lon, zone.labelPos.lat)) return
            const projected = projection([zone.labelPos.lon, zone.labelPos.lat])
            if (!projected) return
            const [x, y] = projected

            const intensity = zone.intensity || 'medium'
            const color = intensity === 'high' ? '#ff3333' : intensity === 'elevated' ? '#ffcc00' : '#ccff00'

            const g = conflictGroup.append('g')
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            g.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({ ...zone, type: 'conflict' })
            })

            g.call(d3.drag()
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

            g.append('circle')
              .attr('r', 10)
              .attr('fill', `${color}33`) // Add alpha
              .attr('stroke', color)
              .attr('stroke-dasharray', '2,2')

            // X symbol for conflict (larger)
            g.append('path')
              .attr('d', 'M-6,-6 L6,6 M6,-6 L-6,6')
              .attr('stroke', color)
              .attr('stroke-width', 2)
              .attr('fill', 'none')
          })
        }

        // Military Bases
        if (layerVisibility.militaryBases) {
          const baseGroup = svg.append('g').attr('class', 'military-bases')
          MILITARY_BASES.forEach(base => {
            if (!isMarkerVisible(base.lon, base.lat)) return
            const projected = projection([base.lon, base.lat])
            if (!projected) return
            const [x, y] = projected
            const g = baseGroup.append('g')
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            g.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({ ...base, type: 'base' })
            })

            g.call(d3.drag()
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

            g.append('circle')
              .attr('r', 6)
              .attr('fill', '#888888')
              .attr('stroke', '#666666')
          })
        }

        // Nuclear Facilities
        if (layerVisibility.nuclearFacilities) {
          const nucGroup = svg.append('g').attr('class', 'nuclear-facilities')
          NUCLEAR_FACILITIES.forEach(nuc => {
            if (!isMarkerVisible(nuc.lon, nuc.lat)) return
            const projected = projection([nuc.lon, nuc.lat])
            if (!projected) return
            const [x, y] = projected
            const g = nucGroup.append('g')
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            g.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({ ...nuc, type: 'nuclear' })
            })

            g.call(d3.drag()
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

            g.append('circle').attr('r', 4).attr('fill', '#ffff00').attr('stroke', '#000')

            // Radiation symbol (three blades, larger)
            g.append('path')
              .attr('d', 'M0,-7.5 L1.5,-3 L-1.5,-3 Z M-4.5,0 L-1.5,-1.5 L-1.5,1.5 Z M4.5,0 L1.5,-1.5 L1.5,1.5 Z')
              .attr('fill', '#000')
              .attr('stroke', 'none')
          })
        }

        // Undersea Cables
        if (layerVisibility.underseaCables) {
          const cablesGroup = svg.append('g').attr('class', 'cables')
          UNDERSEA_CABLES.forEach(cable => {
            const line = d3.line()
              .x(d => projection(d)[0])
              .y(d => projection(d)[1])
              .curve(d3.curveBasis) // Smooth curves for cables

            const pathCoords = cable.points
            // Check if projection is successful for all points to avoid errors
            const valid = pathCoords.every(p => {
              const [x, y] = projection(p) || [null, null]
              return x !== null && y !== null
            })

            if (valid) {
              cablesGroup.append('path')
                .datum(pathCoords)
                .attr('d', line)
                .attr('class', cable.major ? 'major' : '')
                .attr('fill', 'none')
              // Tooltip or interaction could be added here
            }
          })
        }

        // Cyber Regions
        if (layerVisibility.cyberRegions) {
          const cyberGroup = svg.append('g').attr('class', 'cyber-regions')
          CYBER_REGIONS.forEach(reg => {
            if (!isMarkerVisible(reg.lon, reg.lat)) return
            const projected = projection([reg.lon, reg.lat])
            if (!projected) return
            const [x, y] = projected
            const g = cyberGroup.append('g')
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            g.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({ ...reg, type: 'cyber' })
            })

            g.call(d3.drag()
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

            g.append('rect')
              .attr('x', -8).attr('y', -8)
              .attr('width', 16).attr('height', 16)
              .attr('fill', 'none')
              .attr('stroke', '#00ff00')
              .attr('stroke-width', 1)
              .attr('stroke-dasharray', '2,2')

            // Circuit symbol (simple lines, larger)
            g.append('path')
              .attr('d', 'M-6,-3 L6,-3 M-6,3 L6,3 M-3,-6 L-3,6 M3,-6 L3,6')
              .attr('stroke', '#00ff00')
              .attr('stroke-width', 1.5)
              .attr('fill', 'none')
          })
        }

      }

      // Intelligence Hotspots (show on both global and US maps)
      if (layerVisibility.intelHotspots) {
        const intelGroup = svg.append('g').attr('class', 'intel-hotspots')

        // Track current hovered intel for tooltip click
        let currentHoveredIntel = null
        let hideTimer = null

        // Create hover tooltip group (hidden by default) - square container matching sidebar style
        const tooltip = svg.append('g')
          .attr('class', 'marker-tooltip')
          .style('pointer-events', 'none')
          .style('display', 'none')
          .style('cursor', 'pointer')
          .on('mouseenter', function() {
            // Cancel any pending hide so tooltip stays visible
            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
          })
          .on('mouseleave', function() {
            // Hide tooltip when mouse leaves the tooltip area
            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
            tooltip.style('display', 'none')
            currentHoveredIntel = null
          })

        // Tooltip background (square container) - clickable
        tooltip.append('rect')
          .attr('class', 'tooltip-bg')
          .attr('rx', 4)
          .attr('ry', 4)
          .style('pointer-events', 'all')

        // Area name header
        tooltip.append('text')
          .attr('class', 'tooltip-header')
          .attr('x', 12)
          .attr('y', 20)
          .attr('fill', '#00ff88')
          .attr('font-size', '12px')
          .attr('font-weight', '700')
          .attr('text-transform', 'uppercase')
          .attr('letter-spacing', '1px')

        // Divider line between header and content
        tooltip.append('line')
          .attr('class', 'tooltip-divider')
          .attr('x1', 12)
          .attr('y1', 28)
          .attr('x2', 188)
          .attr('y2', 28)
          .attr('stroke', 'rgba(0, 255, 136, 0.3)')
          .attr('stroke-width', 1)
          .style('display', 'none')

        // Loading spinner group (hidden by default) - centered in content area
        const spinnerGroup = tooltip.append('g')
          .attr('class', 'tooltip-spinner')
          .style('display', 'none')

        spinnerGroup.append('circle')
          .attr('class', 'spinner-circle')
          .attr('cx', 100)
          .attr('cy', 50)
          .attr('r', 12)
          .attr('fill', 'none')
          .attr('stroke', '#00ff88')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '20 40')

        // Article title text - using tspan for wrapping
        const textGroup = tooltip.append('g')
          .attr('class', 'tooltip-text-group')
          .attr('transform', `translate(12, 42)`)

        textGroup.append('text')
          .attr('class', 'tooltip-text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('fill', '#e2e8f0')
          .attr('font-size', '10px')
          .attr('font-weight', '500')
          .attr('max-width', '176')

        // Show More button background
        tooltip.append('rect')
          .attr('class', 'tooltip-show-more-bg')
          .attr('rx', 2)
          .attr('ry', 2)
          .attr('fill', 'rgba(0, 255, 136, 0.2)')
          .attr('stroke', '#00ff88')
          .attr('stroke-width', 1)
          .style('display', 'none')
          .style('cursor', 'pointer')
          .style('pointer-events', 'all')

        // Show More button text
        tooltip.append('text')
          .attr('class', 'tooltip-show-more-text')
          .attr('fill', '#00ff88')
          .attr('font-size', '9px')
          .attr('font-weight', '700')
          .attr('text-anchor', 'middle')
          .style('display', 'none')
          .style('pointer-events', 'none')
          .text('SHOW MORE')

        intelHotspots.forEach(intel => {
          // Skip DC in US view since it's already rendered as a city
          if (mapView === 'us' && intel.id === 'dc') return
          if (!isMarkerVisible(intel.lon, intel.lat)) return

          const projected = projection([intel.lon, intel.lat])
          if (!projected) return
          const [x, y] = projected

          // Determine marker color - all intel markers are green
          const hasNews = intel.matchCount && intel.matchCount > 0
          const isHotspot = hasNews && (intel.severity === 'high' || intel.severity === 'critical')
          let markerColor = '#00ff88' // green for all intel markers

          const group = intelGroup.append('g')
            .attr('class', `intel-hotspot ${isHotspot ? 'hotspot' : hasNews ? 'active' : 'inactive'}`)
            .attr('transform', `translate(${x},${y})`)
            .style('cursor', 'pointer')

          // Remove marker click - only hover interaction
          group.style('cursor', 'pointer')

          // First mouseleave handler removed — debounced handler below handles this

          // Show More button click handler
          tooltip.select('.tooltip-show-more-bg').on('click', function(event) {
            event.stopPropagation()
            if (!isDraggingRef.current && currentHoveredIntel) {
              tooltip.style('display', 'none')
              handleIntelHotspotClick({ ...currentHoveredIntel, severity: currentHoveredIntel.severity || 'medium' })
            }
          })

          // Hover tooltip: fetch and show most recent story with area name header
          group.on('mouseenter', async function () {
            // Store current intel for tooltip click
            currentHoveredIntel = intel
            
            // Show loading state immediately with area name
            tooltip.select('.tooltip-header').text(intel.name)
            tooltip.select('.tooltip-divider').style('display', 'none')
            tooltip.select('.tooltip-spinner').style('display', null)
            tooltip.select('.tooltip-show-more-bg').style('display', 'none')
            tooltip.select('.tooltip-show-more-text').style('display', 'none')
            
            const textElem = tooltip.select('.tooltip-text')
            textElem.text('Fetching news...')
            
            tooltip.select('.tooltip-bg')
              .attr('width', 200)
              .attr('height', 80)
              .attr('fill', 'rgba(10, 14, 20, 0.98)')
              .attr('stroke', markerColor)
              .attr('stroke-width', 1)
            tooltip.attr('transform', `translate(${x - 100},${y - 92})`)
            tooltip.style('display', null)
            tooltip.style('pointer-events', 'all')

            // Start spinner animation
            const spinner = tooltip.select('.spinner-circle')
            let rotation = 0
            const spinInterval = setInterval(() => {
              rotation = (rotation + 15) % 360
              spinner.attr('transform', `rotate(${rotation} 100 50)`)
            }, 50)

            try {
              // Fetch fresh news for this intel hotspot
              const newsItems = await MapFeedService.fetchNewsForHotspot(intel)
              clearInterval(spinInterval)

              const recentArticle = newsItems && newsItems.length > 0
                ? newsItems[0]
                : null

              if (recentArticle && recentArticle.title) {
                // Show full article title, dynamically size the container
                const fullTitle = recentArticle.title
                const textElem = tooltip.select('.tooltip-text')
                
                // Word wrap the text manually using tspan
                const words = fullTitle.split(' ')
                const maxWidth = 176
                const lineHeight = 14
                const charWidth = 6 // approx width per character for 10px font
                let lines = []
                let currentLine = ''
                
                words.forEach(word => {
                  const testLine = currentLine ? currentLine + ' ' + word : word
                  const testWidth = testLine.length * charWidth
                  if (testWidth <= maxWidth) {
                    currentLine = testLine
                  } else {
                    if (currentLine) lines.push(currentLine)
                    currentLine = word
                  }
                })
                if (currentLine) lines.push(currentLine)
                
                // Remove all existing tspan children and add new ones
                textElem.selectAll('tspan').remove()
                lines.forEach((line, i) => {
                  textElem.append('tspan')
                    .attr('x', 0)
                    .attr('dy', i === 0 ? 10 : lineHeight)
                    .text(line)
                })
                
                tooltip.select('.tooltip-divider').style('display', null)

                // Calculate dynamic height based on content
                const contentHeight = Math.max(20, lines.length * lineHeight)
                const buttonHeight = 24
                const totalHeight = 42 + contentHeight + 8 + buttonHeight + 8 // header + content + padding + button + padding

                tooltip.select('.tooltip-bg').attr('height', totalHeight)
                
                // Position and show Show More button
                const buttonWidth = 80
                const buttonX = 100 - (buttonWidth / 2)
                const buttonY = 42 + contentHeight + 16
                
                tooltip.select('.tooltip-show-more-bg')
                  .attr('x', buttonX)
                  .attr('y', buttonY)
                  .attr('width', buttonWidth)
                  .attr('height', buttonHeight)
                  .style('display', null)
                  
                tooltip.select('.tooltip-show-more-text')
                  .attr('x', 100)
                  .attr('y', buttonY + 15)
                  .style('display', null)
                  
                tooltip.select('.tooltip-spinner').style('display', 'none')
              } else {
                // No news available
                const textElem = tooltip.select('.tooltip-text')
                textElem.text('No news for this area')
                tooltip.select('.tooltip-divider').style('display', null)
                tooltip.select('.tooltip-bg').attr('height', 60)
                tooltip.select('.tooltip-spinner').style('display', 'none')
              }
            } catch (e) {
              clearInterval(spinInterval)
              console.error('Error fetching news for intel hotspot:', e)
              const textElem = tooltip.select('.tooltip-text')
              textElem.text('Error loading news')
              tooltip.select('.tooltip-divider').style('display', null)
              tooltip.select('.tooltip-bg').attr('height', 60)
              tooltip.select('.tooltip-spinner').style('display', 'none')
            }
          })

          group.on('mouseleave', function () {
            // Delay hide to give mouse time to reach the tooltip without flickering
            hideTimer = setTimeout(() => {
              tooltip.style('display', 'none')
              currentHoveredIntel = null
              hideTimer = null
            }, 150)
          })

          group.call(d3.drag()
            .on('start', () => isDraggingRef.current = false)
            .on('drag', (event) => {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = true
              const sensitivity = 0.5
              const currentRotation = rotationRef.current
              const newRotation = [
                currentRotation[0] + event.dx * sensitivity,
                Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
              ]
              rotationRef.current = newRotation
              setRotation(newRotation)
            })
            .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
          )

          // Pulsing ring
          group.append('circle')
            .attr('r', 8)
            .attr('fill', 'none')
            .attr('stroke', markerColor)
            .attr('stroke-width', 2)
            .attr('opacity', 0.8)
            .attr('class', isHotspot ? 'hotspot-pulse' : '')

          // Inner dot
          group.append('circle')
            .attr('r', 3)
            .attr('fill', markerColor)

          // Label
          group.append('text')
            .attr('x', 12)
            .attr('y', 4)
            .attr('fill', markerColor)
            .attr('font-size', '10px')
            .attr('font-weight', '600')
            .text(intel.name)
        })
      }

      // Add pan/zoom for flat map view
      if (mapView !== 'global' || zoomLevel > 2) {
        const zoom = d3.zoom()
          .scaleExtent([1, 8])
          .on('zoom', (event) => {
            const newScale = event.transform.k
            const newTranslation = [event.transform.x, event.transform.y]
            setZoomLevel(newScale)
            setTranslation(newTranslation)
          })

        svg.call(zoom)
      }

      // Always allow zooming via scroll
      svg.on('wheel.zoom', function (event) {
        event.preventDefault()
        const delta = event.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.max(1, Math.min(8, zoomLevel * delta))
        setZoomLevel(newZoom)
      })
    } catch (error) {
      console.error('Error rendering map:', error)
      setError(`${t('map.failedRender')}: ${error.message}`)
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 8))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 1))
  }

  const handleZoomReset = () => {
    setZoomLevel(1)
    setTranslation([0, 0])
    setRotation([0, 0])
    rotationRef.current = [0, 0]
  }

  const toggleLayer = (layer) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }))
  }

  const handleHotspotClick = async (hotspot) => {
    // Normalize description field - some use 'desc' instead of 'description'
    const normalizedHotspot = {
      ...hotspot,
      description: hotspot.description || hotspot.desc || t('map.situationDefault', { name: hotspot.name }),
      type: hotspot.type || 'hotspot',
      news: []
    }

    // Open modal immediately with loading state
    setSelectedHotspot(normalizedHotspot)
    setNewsLoading(true)

    // Fetch news for this specific marker
    try {
      const newsItems = await MapFeedService.fetchNewsForHotspot(hotspot)
      setSelectedHotspot(prev => prev ? { ...prev, news: newsItems } : null)
    } catch (e) {
      console.error('Error fetching news for hotspot:', e)
    } finally {
      setNewsLoading(false)
    }
  }

  const handleIntelHotspotClick = async (intel) => {
    // Open modal immediately with loading state
    setSelectedHotspot({ ...intel, type: 'intel', news: [] })
    setNewsLoading(true)

    // Fetch news for this specific marker
    try {
      const newsItems = await MapFeedService.fetchNewsForHotspot(intel)
      setSelectedHotspot(prev => prev ? { ...prev, news: newsItems } : null)
    } catch (e) {
      console.error('Error fetching news for intel hotspot:', e)
    } finally {
      setNewsLoading(false)
    }
  }

  const closePopup = () => {
    setSelectedHotspot(null)
  }

  if (loading || (!worldData && !usData)) {
    return (
      <div className="global-map-loading">
        <div className="loading-spinner"></div>
        <div>{t('map.loadingData')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="global-map-error">
        <div className="error-icon">!</div>
        <div>{error}</div>
        <button onClick={loadMapData} style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}>
          {t('common.retry')}
        </button>
      </div>
    )
  }

  // Extra safety check - don't render if we don't have the required data for current view
  if (mapView === 'global' && !worldData) {
    return (
      <div className="global-map-loading">
        <div>{t('map.loadingWorld')}</div>
      </div>
    )
  }

  if (mapView === 'us' && !usData) {
    return (
      <div className="global-map-loading">
        <div>{t('map.loadingUs')}</div>
      </div>
    )
  }

  return (
    <div className="global-map-container" ref={containerRef}>
      {/* Quick Stats Bar */}
      <div className="map-quick-stats">
        <div className="stat-item">
          <span className="stat-label">{t('map.activeConflicts')}</span>
          <span className={`stat-value ${activeConflicts > 2 ? 'critical' : ''}`}>{activeConflicts}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">{t('map.globalAlert')}</span>
          <span className={`stat-value alert-${alertLevel}`}>{t(`map.${alertLevel}`)}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">{t('map.intelHotspots')}</span>
          <span className="stat-value">{totalIntel > 0 ? totalIntel : '—'}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <button 
            className={`auto-rotate-btn ${isAutoRotating ? 'active' : ''}`}
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title={isAutoRotating ? t('map.stopRotation') : t('map.startRotation')}
          >
            {isAutoRotating ? t('map.rotating') : t('map.paused')}
          </button>
        </div>
      </div>
      <div className="map-controls map-controls-right">
        <div className="map-view-toggle">
          <button
            className={mapView === 'global' ? 'active' : ''}
            onClick={() => setMapView('global')}
          >
            {t('map.global')}
          </button>
          <button
            className={mapView === 'us' ? 'active' : ''}
            onClick={() => setMapView('us')}
          >
            {t('map.us')}
          </button>
        </div>
        <div className="map-zoom-controls">
          <button onClick={handleZoomIn} title={t('map.zoomIn')}>+</button>
          <div className="zoom-level">{zoomLevel.toFixed(1)}x</div>
          <button onClick={handleZoomOut} title={t('map.zoomOut')}>−</button>
          <button onClick={handleZoomReset} title={t('map.reset')}>RST</button>
        </div>
      </div>
      <div className="map-controls map-controls-left">
        <div className="map-layer-toggles">
          {/* Layer Presets */}
          <div className="layer-preset-group">
            <button
              className={`layer-preset ${!layerVisibility.shippingChokepoints && !layerVisibility.conflictZones && !layerVisibility.militaryBases ? 'active' : ''}`}
              onClick={() => setLayerVisibility(prev => ({
                ...prev,
                hotspots: false,
                intelHotspots: true,
                shippingChokepoints: false,
                conflictZones: false,
                militaryBases: false,
                nuclearFacilities: false,
                underseaCables: false,
                cyberRegions: false
              }))}
              title={t('map.presetIntelTitle')}
            >
              {t('map.presetIntel')}
            </button>
            <button
              className={`layer-preset ${layerVisibility.conflictZones && layerVisibility.intelHotspots ? 'active' : ''}`}
              onClick={() => setLayerVisibility(prev => ({
                ...prev,
                hotspots: true,
                intelHotspots: true,
                shippingChokepoints: false,
                conflictZones: true,
                militaryBases: false,
                nuclearFacilities: false,
                underseaCables: false,
                cyberRegions: false
              }))}
              title={t('map.presetConflictTitle')}
            >
              {t('map.presetConflict')}
            </button>
            <button
              className={`layer-preset ${layerVisibility.shippingChokepoints && layerVisibility.underseaCables ? 'active' : ''}`}
              onClick={() => setLayerVisibility(prev => ({
                ...prev,
                hotspots: false,
                intelHotspots: false,
                shippingChokepoints: true,
                conflictZones: false,
                militaryBases: false,
                nuclearFacilities: false,
                underseaCables: true,
                cyberRegions: false
              }))}
              title={t('map.presetTradeTitle')}
            >
              {t('map.presetTrade')}
            </button>
            <button
              className={`layer-preset ${layerVisibility.militaryBases && layerVisibility.nuclearFacilities ? 'active' : ''}`}
              onClick={() => setLayerVisibility(prev => ({
                ...prev,
                hotspots: false,
                intelHotspots: true,
                shippingChokepoints: false,
                conflictZones: true,
                militaryBases: true,
                nuclearFacilities: true,
                underseaCables: false,
                cyberRegions: false
              }))}
              title={t('map.presetDefenseTitle')}
            >
              {t('map.presetDefense')}
            </button>
          </div>
          
          {/* Individual Layer Toggles */}
          <div className="layer-toggle-group">
            <button
              className={`layer-toggle ${layerVisibility.intelHotspots ? 'active' : ''}`}
              onClick={() => toggleLayer('intelHotspots')}
              title={t('map.intelligenceHotspots')}
            >
              {t('map.intel')}
            </button>
            <button
              className={`layer-toggle ${layerVisibility.hotspots ? 'active' : ''}`}
              onClick={() => toggleLayer('hotspots')}
              title={t('map.watchZones')}
            >
              {t('map.watch')}
            </button>
            {mapView === 'us' && (
              <button
                className={`layer-toggle ${layerVisibility.usCities ? 'active' : ''}`}
                onClick={() => toggleLayer('usCities')}
                title={t('map.majorCities')}
              >
                {t('map.cities')}
              </button>
            )}
          </div>
          {mapView === 'global' && (
            <div className="layer-toggle-group">
              <button
                className={`layer-toggle ${layerVisibility.conflictZones ? 'active' : ''}`}
                onClick={() => toggleLayer('conflictZones')}
                title={t('map.activeConflictsTitle')}
              >
                {t('map.conflict')}
              </button>
              <button
                className={`layer-toggle ${layerVisibility.shippingChokepoints ? 'active' : ''}`}
                onClick={() => toggleLayer('shippingChokepoints')}
                title={t('map.shippingRoutes')}
              >
                {t('map.shipping')}
              </button>
              <button
                className={`layer-toggle ${layerVisibility.militaryBases ? 'active' : ''}`}
                onClick={() => toggleLayer('militaryBases')}
                title={t('map.militaryBases')}
              >
                {t('map.military')}
              </button>
              <button
                className={`layer-toggle ${layerVisibility.nuclearFacilities ? 'active' : ''}`}
                onClick={() => toggleLayer('nuclearFacilities')}
                title={t('map.nuclearFacilities')}
              >
                {t('map.nuclear')}
              </button>
              <button
                className={`layer-toggle ${layerVisibility.underseaCables ? 'active' : ''}`}
                onClick={() => toggleLayer('underseaCables')}
                title={t('map.underseaCables')}
              >
                {t('map.infra')}
              </button>
              <button
                className={`layer-toggle ${layerVisibility.cyberRegions ? 'active' : ''}`}
                onClick={() => toggleLayer('cyberRegions')}
                title={t('map.cyberRegions')}
              >
                {t('map.cyber')}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="map-labels">
        <div className="map-label bottom-left">
          <span className="legend-item"><span className="legend-dot hotspot"></span>{t('map.high')}</span>
          <span className="legend-item"><span className="legend-dot active"></span>{t('map.medium')}</span>
          <span className="legend-item"><span className="legend-dot inactive"></span>{t('map.noIntel')}</span>
        </div>
        <div className="map-label bottom-right">
          <div>{new Date().toISOString().slice(0, 16).replace('T', ' ')}Z</div>
          <div style={{ fontSize: '9px', opacity: 0.7 }}>
            {t('map.updated', { time: lastUpdated.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) })}
          </div>
        </div>
      </div>
      <svg ref={svgRef}></svg>
      <HotspotModal selectedHotspot={selectedHotspot} onClose={closePopup} newsLoading={newsLoading} />
      <TickerStrip mode="geo" />
    </div>
  )
}

export default GlobalMap
