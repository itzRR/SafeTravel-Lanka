
import React, { useState, useEffect, useRef } from "react";
import "./SriLankaMap.css";

import { districtService, Review } from "@/services/districtService";
// import { districtData as defaultDistrictData } from "../data/districtData"; // Removed local dependence
import { useAuth } from "@/context/AuthContext";
import { Star, StarHalf, MessageCircle, Trash2, CheckCircle, AlertCircle, Info, X, MapPin } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper to check standard mouse vs touch
const isTouch = (e: any) => e.pointerType === 'touch';

const SriLankaMap = () => {
  const [districtData, setDistrictData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>("colombo");
  const [filter, setFilter] = useState("");
  const [scale, setScale] = useState(1.02);
  
  // Notification System State
  const [notification, setNotification] = useState<{show: boolean, type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  
  useEffect(() => {
    const unsubscribe = districtService.subscribeToDistricts((data) => {
        if (data && data.length > 0) {
            const dataMap = data.reduce((acc: any, curr) => {
                acc[curr.id] = curr;
                return acc;
            }, {});
            setDistrictData(dataMap);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  const [tx, setTx] = useState(22);
  const [ty, setTy] = useState(0);
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });


  const svgRef = useRef<SVGSVGElement>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const panZoomRef = useRef<SVGGElement>(null);

  // Interaction State Refs (to avoid stale closures in event listeners)
  const interactionState = useRef({
      isDragging: false,
      isPointerDown: false,
      startX: 0,
      startY: 0,
      startTx: 0,
      startTy: 0,
      scale: 1.02,
      tx: 22,
      ty: 0
  });

  // Sync refs with state
  useEffect(() => {
      interactionState.current.scale = scale;
      interactionState.current.tx = tx;
      interactionState.current.ty = ty;
  }, [scale, tx, ty]);


  // Zoom Helpers
  const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

  const applyTransform = (newScale: number, newTx: number, newTy: number) => {
      setScale(newScale);
      setTx(newTx);
      setTy(newTy);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const sv = svgRef.current;
    if (!sv) return;
    const vb = sv.viewBox.baseVal;
    
    // Effective viewport center in SVG coords
    const vbCx = vb.x + vb.width / 2;
    const vbCy = vb.y + vb.height / 2;

    const { scale: s, tx: tX, ty: tY } = interactionState.current;
    
    const currentCenterX = (vbCx - tX) / s;
    const currentCenterY = (vbCy - tY) / s;

    // Smoother zoom step
    const newScale = clamp(direction === 'in' ? s * 1.3 : s / 1.3, 0.8, 12);
    
    // Adjust transform to keep center fixed
    const newTx = vbCx - currentCenterX * newScale;
    const newTy = vbCy - currentCenterY * newScale;

    applyTransform(newScale, newTx, newTy);
  };

  const handleReset = () => {
    // Reset to roughly centered "cover" style if possible, or just default
    // Using default 22, 0 as established in initial state
    applyTransform(1.02, 22, 0);
  };

  // Wheel Zoom
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !svgRef.current) return;

    const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const { scale: s, tx: tX, ty: tY } = interactionState.current;
        const vb = svgRef.current?.viewBox.baseVal;
        if (!vb) return;

        const vbCx = vb.x + vb.width / 2;
        const vbCy = vb.y + vb.height / 2;

        const currentCenterX = (vbCx - tX) / s;
        const currentCenterY = (vbCy - tY) / s;

        const delta = Math.sign(e.deltaY);
        const factor = delta > 0 ? 1/1.12 : 1.12;
        const newScale = clamp(s * factor, 0.8, 12);

        const newTx = vbCx - currentCenterX * newScale;
        const newTy = vbCy - currentCenterY * newScale;

        applyTransform(newScale, newTx, newTy);
    };

    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, []);

  // Pointer Pan
  useEffect(() => {
      const vp = viewportRef.current;
      if (!vp || !svgRef.current) return;

      const pxToSvg = (dxPx: number, dyPx: number) => {
          const vb = svgRef.current!.viewBox.baseVal;
          const rect = vp.getBoundingClientRect();
          const unitPerPxX = vb.width / Math.max(1, rect.width);
          const unitPerPxY = vb.height / Math.max(1, rect.height);
          return { dx: dxPx * unitPerPxX, dy: dyPx * unitPerPxY };
      };

      const onPointerDown = (e: PointerEvent) => {
           // Don't capture immediately to allow clicks to propagate if no drag occurs
           interactionState.current.isPointerDown = true;
           interactionState.current.isDragging = false;
           interactionState.current.startX = e.clientX;
           interactionState.current.startY = e.clientY;
           interactionState.current.startTx = interactionState.current.tx;
           interactionState.current.startTy = interactionState.current.ty;
      };

      const onPointerMove = (e: PointerEvent) => {
          if (!interactionState.current.isPointerDown) return; 
          if (e.pointerType === 'touch' && e.isPrimary === false) return; 

          // Check for drag threshold
          if (!interactionState.current.isDragging) {
              const dist = Math.hypot(e.clientX - interactionState.current.startX, e.clientY - interactionState.current.startY);
              if (dist > 5) { // 5px threshold
                  interactionState.current.isDragging = true;
                  vp.classList.add('dragging');
                  vp.setPointerCapture(e.pointerId);
              }
          }

          if (interactionState.current.isDragging) {
              const { startX, startY, startTx, startTy } = interactionState.current;
              const delta = pxToSvg(e.clientX - startX, e.clientY - startY);
              setTx(startTx + delta.dx);
              setTy(startTy + delta.dy);
          }
      };

      const onPointerUp = (e: PointerEvent) => {
          interactionState.current.isPointerDown = false;
          if (interactionState.current.isDragging) {
              vp.classList.remove('dragging');
              vp.releasePointerCapture(e.pointerId);
              interactionState.current.isDragging = false;
          }
      };

      vp.addEventListener('pointerdown', onPointerDown);
      vp.addEventListener('pointermove', onPointerMove);
      vp.addEventListener('pointerup', onPointerUp);
      vp.addEventListener('pointercancel', onPointerUp); // handle cancel too

      return () => {
          vp.removeEventListener('pointerdown', onPointerDown);
          vp.removeEventListener('pointermove', onPointerMove);
          vp.removeEventListener('pointerup', onPointerUp);
          vp.removeEventListener('pointercancel', onPointerUp);
      };
  }, []);

  // Interactions
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<any | null>(null);

  // --- Review State (Moved here to be after activeHighlight) ---
  const { user, profile, signInWithGoogle } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [topRatedIndex, setTopRatedIndex] = useState(0);

  useEffect(() => {
    // Reset form when target changes
    setRating(0);
    setReviewText("");
  }, [activeId, activeHighlight]);

  useEffect(() => {
      const timer = setInterval(() => {
          setTopRatedIndex((prev) => (prev + 1) % 3);
      }, 5000);
      return () => clearInterval(timer);
  }, []);

  // Notification Helper
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
      setNotification({ show: true, type, message });
      setTimeout(() => setNotification(null), 3000);
  };

  const handleRate = (star: number) => {
      setRating(star);
  };

  const calculateAverage = (reviews: Review[]) => {
      if (!reviews || reviews.length === 0) return 0;
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      return total / reviews.length;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
          signInWithGoogle();
          return;
      }
      if (rating === 0) {
          showNotification('error', "Please select a star rating!");
          return;
      }

      setReviewSubmitting(true);
      
      const newReview: Review = {
          userId: user.uid,
          userName: user.displayName || "Traveler",
          userImage: user.photoURL || null,
          avatarProvider: profile?.avatarProvider,
          avatarSeed: profile?.avatarSeed,
          rating: rating,
          comment: reviewText,
          date: new Date().toISOString()
      };

      try {
          // Identify Target: District or Highlight
          const targetDistrict = districtData[activeId!];
          const updatedDistrict = { ...targetDistrict };

          if (activeHighlight) {
              const hlIndex = updatedDistrict.highlights.findIndex((h: any) => h.title === activeHighlight.title);
              if (hlIndex > -1) {
                  const hl = { ...updatedDistrict.highlights[hlIndex] };
                  const currentReviews = hl.reviews || [];
                  
                  if (currentReviews.some((r: Review) => r.userId === user.uid)) {
                      showNotification('info', "You have already reviewed this spot!");
                      setReviewSubmitting(false);
                      return;
                  }

                  const newReviews = [newReview, ...currentReviews];
                  hl.reviews = newReviews;
                  hl.averageRating = calculateAverage(newReviews);
                  
                  updatedDistrict.highlights[hlIndex] = hl;
                  setActiveHighlight(hl);
              }
          } else {
              const currentReviews = updatedDistrict.reviews || [];
              
              if (currentReviews.some((r: Review) => r.userId === user.uid)) {
                  showNotification('info', "You have already reviewed this district!");
                  setReviewSubmitting(false);
                  return;
              }

              const newReviews = [newReview, ...currentReviews];
              updatedDistrict.reviews = newReviews;
              updatedDistrict.averageRating = calculateAverage(newReviews);
          }

          setDistrictData((prev: any) => ({
              ...prev,
              [activeId!]: updatedDistrict
          }));

          await districtService.updateDistrict(activeId!, updatedDistrict);
          
          setRating(0);
          setReviewText("");
          showNotification('success', "Review posted successfully!");

      } catch (error) {
          console.error("Failed to submit review", error);
          showNotification('error', "Failed to submit review. Please try again.");
      } finally {
          setReviewSubmitting(false);
      }
  };

  const executeDeleteReview = async (review: Review) => {
       try {
            const targetDistrict = districtData[activeId!];
            const updatedDistrict = { ...targetDistrict };

            if (activeHighlight) {
                 const hlIndex = updatedDistrict.highlights.findIndex((h: any) => h.title === activeHighlight.title);
                 if (hlIndex > -1) {
                     const hl = { ...updatedDistrict.highlights[hlIndex] };
                     const currentReviews = hl.reviews || [];
                     const newReviews = currentReviews.filter((r: Review) => r.userId !== user?.uid);
                     
                     hl.reviews = newReviews;
                     hl.averageRating = calculateAverage(newReviews);
                     updatedDistrict.highlights[hlIndex] = hl;
                     setActiveHighlight(hl);
                 }
            } else {
                 const currentReviews = updatedDistrict.reviews || [];
                 const newReviews = currentReviews.filter((r: Review) => r.userId !== user?.uid);
                 
                 updatedDistrict.reviews = newReviews;
                 updatedDistrict.averageRating = calculateAverage(newReviews);
            }

            setDistrictData((prev: any) => ({
                ...prev,
                [activeId!]: updatedDistrict
            }));

            await districtService.updateDistrict(activeId!, updatedDistrict);
            showNotification('success', "Review deleted.");

       } catch (error) {
           console.error("Failed to delete review", error);
           showNotification('error', "Failed to delete review.");
       } finally {
            setReviewToDelete(null);
       }
  };

  const handleDeleteReview = (review: Review) => {
      if (!user || user.uid !== review.userId) return;
      setReviewToDelete(review);
  };

  useEffect(() => {
     // Safeguard: Ensure correct image if state somehow gets out of sync, or on district change
     if (activeHighlight) {
        // Handled in click, but good for safety
     } else if (activeId && districtData[activeId]) {
         // This runs when activeId changes, setting the district image
         setDisplayImage(districtData[activeId].image);
     }
  }, [activeId, districtData]);

  // Scroll active item into view in sidebar
  useEffect(() => {
    if (activeId) {
      const el = document.getElementById(`btn-${activeId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeId]);

  const handleDistrictClick = (id: string) => {
      if(districtData[id]) setActiveId(id);
  };

  const handleSpotClick = (h: any) => {
      setActiveHighlight(h);
      // Update image immediately to avoid flash
      if (h.image && h.image.startsWith('http')) {
          setDisplayImage(h.image);
      } else {
        const query = encodeURIComponent(`${h.title} Sri Lanka aesthetic`);
        setDisplayImage(`https://source.unsplash.com/800x600/?${query}`);
      }
  };
  
  const handleMouseEnter = (id: string, e: React.MouseEvent) => {
      const d = districtData[id];
      if(!d || !mapWrapRef.current) return;
      
      const rect = mapWrapRef.current.getBoundingClientRect();
      // Calculate relative position for tooltip
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setTooltip({ show: true, text: d.name, x, y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
      if(!tooltip.show || !mapWrapRef.current) return;
       const rect = mapWrapRef.current.getBoundingClientRect();
       setTooltip(prev => ({ 
           ...prev, 
           x: e.clientX - rect.left, 
           y: e.clientY - rect.top 
       }));
  };

  const handleMouseLeave = () => {
      setTooltip(prev => ({ ...prev, show: false }));
  };

  const activeDistrict = activeId ? districtData[activeId] : null;



  if (loading) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-black/90">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-emerald-400 font-mono text-sm animate-pulse">Loading Map Data...</p>
                </div>
          </div>
      );
  }

  return (
    <div className="map-page-container relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="map-clouds-container">
            <img src="/assets/cloud-1.png" className="map-cloud c1" alt="" />
            <img src="/assets/cloud-2.png" className="map-cloud c2" alt="" />
            <img src="/assets/cloud-1.png" className="map-cloud c3" alt="" />
        </div>
        
        {/* Swinging Tree */}
        <img src="/assets/tree.png" className="swinging-tree" alt="" />
        
        {/* Balloons */}
        <img src="/assets/hotballon-Left.png" className="absolute top-20 left-10 w-32 z-[5] animate-balloon-left opacity-90" alt="Hot Air Balloon" />
        <img src="/assets/hotballon-right.png" className="absolute top-32 right-10 w-24 z-[5] animate-balloon-right opacity-80" alt="Hot Air Balloon" />

      <div className="text-center mb-12 animate-fade-in relative z-10">
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-gradient-emerald mb-4 drop-shadow-sm">
          The Unscripted Map
        </h2>
        <p className="text-muted-foreground text-lg tracking-wide uppercase font-light">
          Navigate the untold stories of Ceylon
        </p>
      </div>

      <div className="layout">
        <aside className="card-panel sidebar flex flex-col h-[70vh] min-h-[500px] backdrop-blur-md border border-white/10 bg-black/20 rounded-xl overflow-hidden shadow-2xl">
          {/* Best Rated Widget - Sticky Top */}
          <div className="p-4 bg-gradient-to-b from-black/40 to-transparent">
              {(() => {
                  // Aggregate all rated items
                  const allRatedItems: any[] = [];
                  Object.values(districtData).forEach((d: any) => {
                      if (d.averageRating) {
                          allRatedItems.push({ ...d, type: 'district', parentId: d.id });
                      }
                      if (d.highlights) {
                          d.highlights.forEach((h: any) => {
                              if (h.averageRating) {
                                  allRatedItems.push({ ...h, type: 'highlight', parentId: d.id });
                              }
                          });
                      }
                  });

                  // Sort by rating
                  allRatedItems.sort((a, b) => b.averageRating - a.averageRating);
                  const topItems = allRatedItems.slice(0, 3);
                  
                  if (topItems.length === 0) return (
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                          <span className="text-2xl mb-2 block">⭐</span>
                          <h3 className="text-amber-200 font-bold text-sm uppercase">Top Rated</h3>
                          <p className="text-xs text-slate-500 mt-1">Start reviewing to see top locations!</p>
                      </div>
                  );

                  const currentItem = topItems[topRatedIndex % topItems.length];
                  // Use district image as fallback for highlights if needed
                  const bgImage = currentItem.image || (currentItem.type === 'highlight' && districtData[currentItem.parentId]?.image) || '/assets/hero.jpg';

                  return (
                      <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 group h-48 transition-all hover:scale-[1.02] duration-500 cursor-pointer"
                           onClick={() => {
                                  if (currentItem.parentId) {
                                      handleDistrictClick(currentItem.parentId);
                                      if (currentItem.type === 'highlight') {
                                          setTimeout(() => {
                                            const d = districtData[currentItem.parentId];
                                            const h = d?.highlights?.find((hl: any) => hl.title === currentItem.title);
                                            if (h) {
                                                setActiveHighlight(h);
                                                if (h.image && h.image.startsWith('http')) {
                                                    setDisplayImage(h.image);
                                                } else {
                                                    const query = encodeURIComponent(`${h.title} Sri Lanka aesthetic`);
                                                    setDisplayImage(`https://source.unsplash.com/800x600/?${query}`);
                                                }
                                            }
                                          }, 0);
                                      }
                                  }
                           }}
                           title="Click to explore"
                      >
                          {/* Background Image */}
                          <div className="absolute inset-0">
                              <img 
                                  src={bgImage}
                                  alt={currentItem.name || currentItem.title} 
                                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                              <div className="flex items-center gap-2 mb-1">
                                  <div className="bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-lg shadow-amber-500/20">
                                      <span>#{(topRatedIndex % topItems.length) + 1}</span>
                                      <Star className="w-3 h-3 fill-black text-black" />
                                      {currentItem.averageRating.toFixed(1)}
                                  </div>
                                  <span className="text-amber-300 text-xs font-bold uppercase tracking-wider drop-shadow-md">Top Rated</span>
                              </div>
                              <h3 className="text-lg font-bold text-white leading-tight drop-shadow-lg mb-1 truncate">
                                  {currentItem.name || currentItem.title}
                              </h3>
                              <p className="text-xs text-slate-300 line-clamp-1 opacity-90">
                                  {currentItem.type === 'district' ? 'District' : `Highlight in ${districtData[currentItem.parentId]?.name}`}
                              </p>
                          </div>

                          {/* Navigation Dots */}
                          <div className="absolute top-3 right-3 flex gap-1 z-30">
                              {topItems.map((_, idx) => (
                                  <div 
                                      key={idx} 
                                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${idx === (topRatedIndex % topItems.length) ? 'bg-white w-3' : 'bg-white/40 hover:bg-white/60'}`}
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          setTopRatedIndex(idx);
                                      }}
                                  />
                              ))}
                          </div>
                      </div>
                  );
              })()}

              <div className="search relative">
                <input 
                    id="q" 
                    type="search" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-slate-500 transition-all"
                    placeholder="Find a district..." 
                    autoComplete="off"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)} 
                />
                <div className="absolute right-3 top-2.5 text-slate-500 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
              </div>
          </div>

          <div className="district-list flex-grow overflow-y-auto custom-scrollbar px-2 pb-4">
             {/* List Logic */}
             {Object.entries(districtData).sort((a:any,b:any) => {
                 // Sort by rating if available, else name
                 const ratingA = a[1].averageRating || 0;
                 const ratingB = b[1].averageRating || 0;
                 if (ratingA !== ratingB) return ratingB - ratingA; // Descending rating
                 return a[1].name.localeCompare(b[1].name);
             }).map(([id, d]: any) => {
                 if (filter && !d.name.toLowerCase().includes(filter.toLowerCase())) return null;
                 return (
                    <div 
                        key={id} 
                        id={`btn-${id}`}
                        className={`district-btngroup p-3 mb-2 rounded-lg cursor-pointer border border-transparent transition-all duration-300 hover:bg-white/5 ${activeId === id ? 'bg-emerald-900/40 border-emerald-500/30 shadow-lg' : 'opacity-80 hover:opacity-100'}`}
                        onClick={() => handleDistrictClick(id)}
                    >
                        <div className="flex justify-between items-center w-full">
                            <div className={`font-medium text-sm transition-colors ${activeId === id ? 'text-emerald-400' : 'text-slate-300'}`}>
                                {d.name}
                            </div>
                            {Boolean(d.averageRating && d.averageRating > 0) && (
                                <div className="flex items-center gap-1 text-xs bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    <span className="text-amber-200 font-mono font-bold">{d.averageRating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                 );
             })}
          </div>
        </aside>

        <main className="main">
          <section className="card-panel mapcard">
            <div className="mapgrid">
               {/* Map Wrap Section - Unchanged */}
              <div className="mapwrap" ref={mapWrapRef}>
                <div className="map-controls">
                  <button type="button" className="mc-btn" onClick={() => handleZoom('in')} title="Zoom in">＋</button>
                  <button type="button" className="mc-btn" onClick={() => handleZoom('out')} title="Zoom out">－</button>
                  <button type="button" className="mc-btn" onClick={handleReset} title="Reset view">⟳</button>
                </div>
                <div className="viewport" ref={viewportRef}>
                  <svg 
                    viewBox="-220 -80 840 960" 
                    className="sl-map" 
                    ref={svgRef}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ pointerEvents: 'none' }} 
                  >
                      <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
                          <g transform="translate(-260,-80)"> 
                             {/* ... paths remain same, content here doesn't change ... */}
                             {/* BUT we need to output the paths. Since I can't easily skip lines in replacement without writing them, 
                                 I will just keep the Map component structure as is. 
                                 Wait, the replacement chunk must match exactly.
                                 The original file has a huge block of SVG paths.
                                 I should probably target the `layout` div and Replace the Sidebar and keeping Main intact but insert Review into InfoCard.
                                 Let's do Sidebar First then InfoCard separately to handle complexity.
                             */}
                             {/* ABORTING this huge replacement. I'll split it. Sidebar First. */}
<path id="colombo" d="M287.1 713l4.9 1.9 3.8 2 4.1 1 1.8-1 2.1-0.8 11.5 3.3 4-0.8 3.9-0.2 3.1 1.9 2.7 2.5 2.6 1.4 2.7 1.1 4.1 0.5 4.9-0.3 0.3-4.5 0.9-4.4 3.7-3.6 4.6-2.1 6.2 0.6 4.2-1.5 5 0.4 4 2 0.7 4.2-3.1 2.9 0.3 2.2 0.1 2.3-2.9 3.6-2.5 4-1 3.2-1.2 2.8 5.7 6-5.1 4.6-6.7-1.6-7.5 3.2 1.5 6.7-4.5-1.2-3-6.9-1.2-0.7-1.5-0.3-2.8 3.3-3.6 1.8-2.5-1.1-2.6 0.3-8.9 7.6-2.5 1.1-2.7 0.7-6.7 2.5-10.6-6.7-0.3 3.9 1.4 4.3 0.7 3 0.1 2.9-0.1 0.1-0.4 0.6-8.6-22.1-3.1-17.5-0.3-1.7 0-16.7 0.3-0.7z" className={`district-shape ${activeId === 'colombo' ? 'active' : ''}`} onClick={() => handleDistrictClick('colombo')} onMouseEnter={(e) => handleMouseEnter('colombo', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="gampaha" d="M282.1 640.8l5.5 0.2 4.3-1.1 4.5-0.6 1.8 2 2.7 0.4 3.4-2.2 4 1.6 4.9-1.9 8.8-6.9 5.5-0.2 6.4 4.4 6.6-1.9 5.7-4 6.4-1.2 2.1 2.3 0.6 2 1.4 1.9 5.7 6.6 4 2.9 0.4 3.1-2.3 1.8-0.6 8-3 2.8-3.6 1.9-1 6.6 2.8 5.8 5.6-1.3 4.9 1.4-1.7 3.9-3.4 2.4-2.9 6.7-1.2 6.8 3.4 11 0.1 2.1-0.7 1.9-4.2 1.5-6.2-0.6-4.6 2.1-3.7 3.6-0.9 4.4-0.3 4.5-4.9 0.3-4.1-0.5-2.7-1.1-2.6-1.4-2.7-2.5-3.1-1.9-3.9 0.2-4 0.8-11.5-3.3-2.1 0.8-1.8 1-4.1-1-3.8-2-4.9-1.9 2.3-5.5 0.6-2.6-0.1-2.7 0-0.1-11-39.2 1.5-5.8-0.1 3.6 0.9 2.2 1.2 1.7 1.1 2.1 2.2 7.7 1.1 1.9 1.4 0 0.4-2.2 0.6-0.9 0.6-0.2 0.2 0.1-0.1-7.1-0.5-3.1-1.2-2.6-1.1-0.7-3-0.7-1.3-0.9-0.2-0.3-0.8-1.7 0.4-1.9 0.8-1.7 0.5-1.6-1.4-10z" className={`district-shape ${activeId === 'gampaha' ? 'active' : ''}`} onClick={() => handleDistrictClick('gampaha')} onMouseEnter={(e) => handleMouseEnter('gampaha', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="kalutara" d="M298.8 771.7l0.4-0.6 0.1-0.1-0.1-2.9-0.7-3-1.4-4.3 0.3-3.9 10.6 6.7 6.7-2.5 2.7-0.7 2.5-1.1 8.9-7.6 2.6-0.3 2.5 1.1 3.6-1.8 2.8-3.3 1.5 0.3 1.2 0.7 3 6.9 4.5 1.2-1.5-6.7 7.5-3.2 6.7 1.6 0.8 4.7 4 10.7-0.3 3.7 1.4 4.4 2.3 4.6 7 6.8 1.4 6.8 2.5 2.4 3.2 1.2 5.2 4.7 3.3 6.4-3.5 1.4 1.3 3.9 9.7 13.7 8.3 14.5-8.2 1.9-8 5-4.3 1.9 0 4.9 1.7 5.1-0.4 4.6-3.6-2.8-3.6-3.5-6.8-5.2-7 0.6-6.3 3.5-9.9-1.9-3.9-2.6-3.7-3.2-4.6-2-4.2-0.9-8.4-3.9-1.2-2-1.7-1.6-2.3 0.9-1.5 1-1.4-1.2-1.2-1.7-1.6-0.4-1-4-0.5-0.4-1-0.6-1-0.9-0.6-1.2 0.2-1.4 1.1-0.3 1.2 0.1 0.6 0-1.8-12.2-0.1-1-4.8-12.3-11.2-28.7z" className={`district-shape ${activeId === 'kalutara' ? 'active' : ''}`} onClick={() => handleDistrictClick('kalutara')} onMouseEnter={(e) => handleMouseEnter('kalutara', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="kandy" d="M428.6 698.3l0.2-4.6 1.6-3.6-1.6-2.9-3.5-8.4 2.6-2.4 8-1.3 3.6-3.9 2.5-0.2 2.5-0.6 1.8-2.8 1.3-3.1-2.6-3.4-3.4-3.3 0-3.4 0.5-4.1-2.8-3.4-5.8-3.3-2-1.4 0.4-4.5-10-8.7-2.8-7.1 4.8 0.5 4.1-1.2-0.4-1.1-0.2-1.5 0.8-1.4 1-1.3 0.7-4.6 3.4 0 3.5 2.5 4 0.3 0.3-2.4-0.3-2.6 3.3-1.8 3.4 0.5 2.4-1.2-1.3-3.1-1.9-3 2.7-0.7 2.8-1.3 4.7 6.6 14.7 9.2 8.4 0.5 5-5.5-0.8-8.5 1.4-3.6 3.2-2 3.4 1.4 8.6 7.1 6.6-1 7.3-6.1 9.5 0.1 3.8-1.9 2.8 3.5 1.7-0.9 1.4-1.3 2.6-4.3 4.7-0.7 7.3 0.8 2 35.1 5 16.8-0.4 7.6-6.2 5.7-4.9 1.4-2.9 1.8-9.6-1.9-9.9 1.4-8.4-0.6-5.3-8.4-2-0.2-2.4-0.9-3.3-4.4-4-3.6 0.7 6.7 2.1 8.7-4.7 7.9-14.8 17.6-4-1-4.5 0.1-6.7 4.6-4.6 1-8.4-1-5.2 4.2 1.9-0.6 1.8 0.8 4.1 7.5 3.4 3.3 2.7 3.7-2.7 7.8-5 5.3-6.7-4-10.4-15.4-6.6-0.6z" className={`district-shape ${activeId === 'kandy' ? 'active' : ''}`} onClick={() => handleDistrictClick('kandy')} onMouseEnter={(e) => handleMouseEnter('kandy', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="matale" d="M549.8 537.3l-0.2 3.9 1.7 5.3 0.5 4.4-2.2 11.1-2.3 10.9 1.2 19-7.3-0.8-4.7 0.7-2.6 4.3-1.4 1.3-1.7 0.9-2.8-3.5-3.8 1.9-9.5-0.1-7.3 6.1-6.6 1-8.6-7.1-3.4-1.4-3.2 2-1.4 3.6 0.8 8.5-5 5.5-8.4-0.5-14.7-9.2-4.7-6.6 0.1-2.4 1.3-1.7 0.5-2.8-0.7-2.9-1.2-2.5-1.4-2.3-2.3-4.7 0.6-4.9 3.3-3 0.8-2-0.1-2.1 0.7-2.7 0.1-2.7-4.2-4.2-1.3-7.2-0.7-7.7-1.1-1.7-0.9-0.6 0-4-1.6-4-2.3-3.8-1.6-3.7-1.8-0.5-2-1.1-0.6-4.1 1.1-3.8 4.9-3.6 7.7-2.9 4.1-4.9 3.7 0.1 2.8 1.8 3.4-2.3 1.7-2.8 1.6-1.2 1.5-0.8-0.1-1.7-0.6-1.1 3-3 2.2-3.4 0-4.3 1.2-3.8 2.4 0 1.7 0.5 1.3-1 4.5-4.7 3-2.6 4.4-2.2 4.8-2 2 2 3.2 3.6-0.1 4.1 1.3 1.3 1.9 0.8 1.5-1 0.1-1.5 2.8-1.3 2.7 0.8 3.6 0.7 3.4 2.1-6.9 7.2-2.3 11-0.6 5.4-2.2 9.4-0.8 1.6-0.4 1.7-6.7 1.5-1.6 6.4 3.1 14.1-0.4 4.6 2.3 3.2 6.1 1.3 5.8-2.4 4.5-4.2 2 2.8 3.6 2.2 1-4.1 0.5-4.1 12.3 0.8 12-2.2z" className={`district-shape ${activeId === 'matale' ? 'active' : ''}`} onClick={() => handleDistrictClick('matale')} onMouseEnter={(e) => handleMouseEnter('matale', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="nuwara-eliya" d="M508.4 753.2l-13.1 6.8-7.2 1-7.6-0.3-5.7 0.5-4.9 0.8-12.6-1.7-12-2.7-5.6-0.5-4.8-3.6 0.9-2.4 1.7-1.6-1.5-1.7 0.1-3.8 2.7-2.4-0.4-3.1-1.8-6.1-5.3-4-6.7-2.1-2-6.7 1.6-8.7-1.5-1.5-1.2-1.7 1.2-1.8 1.8-0.6 3.2-2.8 2-3.3-0.8-0.2-0.3-0.7 6.6 0.6 10.4 15.4 6.7 4 5-5.3 2.7-7.8-2.7-3.7-3.4-3.3-4.1-7.5-1.8-0.8-1.9 0.6 5.2-4.2 8.4 1 4.6-1 6.7-4.6 4.5-0.1 4 1 14.8-17.6 4.7-7.9-2.1-8.7-0.7-6.7 4 3.6 3.3 4.4 2.4 0.9 2 0.2 5.3 8.4 8.4 0.6 9.9-1.4 9.6 1.9-0.2 4.2 1.7 5.8-0.5 2.1 0.5 2 1 1.2 0.9 1.2-1.6 2-1.1 2.1 1.2 4.1 0.4 1.6-0.8 1.7-1.5 2-1.9 1.7-2.1 4.1-1 4.5-5.1 7.6-8.8 1.9-4.1 2-3.7 3.4-1.1 4.6-3.1 3.5-4.3-0.2-4.2 0.2 0.3 3.7 7.3 3.7 1.6 3.2 1.3 3.6 1.2 1.4 0.9 1.6-3.4 5.5 2.1 1.4 2.1 1-2.3 3.4-4.4 1.1z" className={`district-shape ${activeId === 'nuwara-eliya' ? 'active' : ''}`} onClick={() => handleDistrictClick('nuwara-eliya')} onMouseEnter={(e) => handleMouseEnter('nuwara-eliya', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="galle" d="M317.7 834.6l1.6 0.4 1.2 1.7 1.4 1.2 1.5-1 2.3-0.9 1.7 1.6 1.2 2 8.4 3.9 4.2 0.9 4.6 2 3.7 3.2 3.9 2.6 9.9 1.9 6.3-3.5 7-0.6 6.8 5.2 3.6 3.5 3.6 2.8 0.4-4.6-1.7-5.1 0-4.9 4.3-1.9 8-5 8.2-1.9 2.8 2.9 3.2 2.7 3.9 1.6 3.4 0.1 7.2 3.5 3.7-0.1 2 2.9-4.8 1.4-3.1 3.1 2.7 4.2 3.6 3.5-1.4 6.6-7.1-1.6-4.4-4.2-4.9-3.6-3.8-1.2-3.7 1 2.3 4.3 4.6 2.9 4.8 7 1.8 6.6-4.1 5-8.1-1.4 2.4 2.8 1.1 3.8-1.6 4.8-2.1 4.5 1.5 4.5 3.5 3.4 4.1 2.8 3.7 3.3-3.2 3.7-3.6 3.7-3.2 1.3-1.4 2.2 0.7 2.4 1.8 1 4.1 1.7-1.4 2.8-4.2 1.5-2.5 4.5 0 2.6 0.4 2.4 0.1 0.3-1.5-0.3-1.1-0.5-0.8-1-1-1.1-1.8-0.5-1 0.3-0.9 0.8-0.9 0.6-1.2 0-0.4-0.3-0.4-0.4-1.4-2-0.8-0.5-0.1-0.1-1.7-0.6-9.8-3.5-4.1-0.9-2.8-0.6-5-4-1.2-0.5-2.2-1.1-1.7 1.7-4.3-3.5-18.8-19.9-1.5-1.2-0.2-0.2-0.5-0.7-0.3-0.9 0.1-2-0.6-1-0.8-1.1-2.1-2.7-10.6-22.5-0.5-2.1 0.1-2 0-1.9-0.4-1.2-1.9-4-1.9-10.8-4.3-7.6-2.6-10.9z" className={`district-shape ${activeId === 'galle' ? 'active' : ''}`} onClick={() => handleDistrictClick('galle')} onMouseEnter={(e) => handleMouseEnter('galle', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="matara" d="M410.6 945.3l-0.1-0.3-0.4-2.4 0-2.6 2.5-4.5 4.2-1.5 1.4-2.8-4.1-1.7-1.8-1-0.7-2.4 1.4-2.2 3.2-1.3 3.6-3.7 3.2-3.7-3.7-3.3-4.1-2.8-3.5-3.4-1.5-4.5 2.1-4.5 1.6-4.8-1.1-3.8-2.4-2.8 8.1 1.4 4.1-5-1.8-6.6-4.8-7-4.6-2.9-2.3-4.3 3.7-1 3.8 1.2 4.9 3.6 4.4 4.2 7.1 1.6 1.4-6.6-3.6-3.5-2.7-4.2 3.1-3.1 4.8-1.4 4.5-0.7 4.5-1 1.6-3.8 3.9 0 10.2-1.4 3.3 6.2-1.5 4.1 4.1 0.7 5.5-0.9 2.6 3.2-0.2 2.2 3 2.2-1.2 1.2 0 2.2-2.2 0.9 0.4 1.7-1.6 4.1 1.6 3.7-8.9 6.7-2.8 9.9 4 2.9 4.4 1.6 2-0.3 1.3 1.2-1.1 2.4-1.4 2.1 0.8 4 3.8 2 2.7-0.4 2.5 0.5-0.8 2-2.1 2 2.5 8.9-7.5 3.2 0.6 3.7 3.2 2.1 2.2 0.2 2 1.1-0.1 1.9-1.7 0.9 2.8 4.2 5.8 2.7 1.3 0.7-3.5 4.1-9.5-0.5-3.9 0.5-3.1 1.2-3.2 1.8-5.6 4.2-1.6 0.4-1.6 0.3-3.8-1.4-4.1-2.1-2.3-0.7-1.6-0.5-13.4 1.6-3.8-0.8-1.9-1.9-1.2-2.5-1-1.5-0.7-1.1-3.9 2.3-3.5 0.3-6.2-0.9z" className={`district-shape ${activeId === 'matara' ? 'active' : ''}`} onClick={() => handleDistrictClick('matara')} onMouseEnter={(e) => handleMouseEnter('matara', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="hambantota" d="M490 942.5l-1.3-0.7-5.8-2.7-2.8-4.2 1.7-0.9 0.1-1.9-2-1.1-2.2-0.2-3.2-2.1-0.6-3.7 7.5-3.2-2.5-8.9 2.1-2 0.8-2-2.5-0.5-2.7 0.4-3.8-2-0.8-4 1.4-2.1 1.1-2.4-1.3-1.2-2 0.3-4.4-1.6-4-2.9 2.8-9.9 8.9-6.7-1.6-3.7 1.6-4.1-0.4-1.7 2.2-0.9 13.1 2.6 16.9 6.1 4.5 0.7 4.4-1.1 4.4-0.4 3.5 2.8 2.7 3.1 8.4 1.7 4.9 1.6 1.1-4.1-2.1-5.9-4.3-4.7 5.7-3.7 5.8-3.2 6.5-2.1 5-3.8-2.2-5.2 1.1-5.2 2.9 0 3.2-0.3 1.9-2.6-0.1-3.1 2.9 2 2.1-2.5 5.8 0 5.8 0.7 3.9 1.4 1.7 4.2 2.3 0.4 2.5-0.1 2.1-1.5 2.9-0.4 4.3 5.7 3.6 6 5.7 2.4 6.3-3.5 2.3-2.3 3.5-1.4 6.7-1.8 13.7-5.3 2.6-1.8 0.5 0.6 2.1 0.3 6.1-2.2 6.4 1.4 3-4.9 0-2-0.1-1.9 1-1.4 1-1.7-1.1-3.1-0.1-3.9 4.5-3.7 5.5-2.4 4.2-4.1 4.9-3.7 6.2-1.1 4.1-4.9 6.9 8.5 2.6 0.2 3 0.4 3.8 4.4 5.6 1.8 2.1 0.6-7.1 11.2-7.2 7.3-13.4 9.5-4.4 1.3-5.8 3.1-42.8 33.7-8.6 4.7-27.8 9.8-0.4-3.3 0-0.2-1.6-1.3-0.1 0-0.3 0.1-1.4 0.4-0.9 1.8-0.5 3.9-1.2 1.5-2 0.6-2.7 1.1-5 3.1-5 2.2-24 5.1-11.7 4-12.7 2.4-5.8 2.2-3.5 4.9-6.3-1.2-3.8 1.5-2.2 0.8-8.9 6.6-8.8 6.6-0.6 0.6z" className={`district-shape ${activeId === 'hambantota' ? 'active' : ''}`} onClick={() => handleDistrictClick('hambantota')} onMouseEnter={(e) => handleMouseEnter('hambantota', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="jaffna" d="M466.1 133.1l-1.4 1.2-1.2 0.8-15.7-10.8-5.4-2.5-4.8-1.1-0.7-0.3-0.7-0.3-4.1-3.2-1.6-0.9-1.6-0.3-1.9 0.1-0.4-2.3-3-9 0.6 0.3 0-1.8-8.4-4.2-20.3-16.7-16.6-19.2-8.4-4.6-13.2-3.1-3.5-2.5-0.5-3.6 4.9-2.1 1.5-0.3 4.8-0.8 9.6-0.4 4.6 0.8 3.2 2.3 2.1 7.6 2.1 3.2 30.2 35.7 4.4 3.2 9 5.2 36.4 29.6z m-85.3-37.6l-11.8-5.2-4.3-2.5-2.9 0 0.6 5.7 1.6 1.6 2.4 1.9 1.5 2.3-1.5 3-1.7 0.6-1.7-1-1.5-1.3-4.5-2.3-8.6-7.5-4.9-2.1 2.5 2.8 4.5 3.9 2.6 2.8-5.6-1-5.5-2.3-11.1-6.2-8.9-7-5.2-1.9-0.5-0.3-2-1.3-1.9-0.8-0.3 1.7-2.5-1.7-1-2.3-0.4-2.7-0.9-3-1.5-2.6-0.9-1.2-2.4-3.1-1.5-2.7 5-2.5 9.1-8.5 4-1.8 0.1 0 18 1.6 9.4-1.1 3.4 0.4 1.4 3.2-0.3 4.9 0.7 1.7 2 0.6 1.9 0.3 5.5 1.4 1.2 0.7 1 2 2.5-0.1 1.9-0.6 0.8-0.2 1.1-0.2 0.8-0.1 1.8 1.1 0.8 0.4 6.4 7.1 9.3 10.1 0 0.1-3.1 6.7-4.9 8.5z m-121 27l-1.9 1.7-1.9 1.8-5.8 0.4-5.4-1.8-2.3-3 0-9.6 0.6-2.4 1.6 0.3 1.5 2 1 2.4 4 1.3 4.7 0.4 1.2 0.8 2.7 5.7z m38-27.4l-3.6-2.6-3.5-5.4-5.6-11.2 2.5-4 0.6-5.1 1.5-4.2 5-1.1 2.6 0.8 0.1 0 0.2 2-0.9 2.8-0.6 3.1 0.1 3.2 0.3 2.6 0 0.2 0.2 0.5 0.8 1.8 1.1 1.2 0.8 1 1 0.2 4.5-0.2 0.7 0.7 0.3 3.5 0.6 1.4 2.6 1.7 3.6 1.5 3 1.7 0.2 0.6 0.8 1.7-1.6 1.6-3 0-3.3-1-2.3-1.4-1.6-0.4-4.2 2.4-2.9 0.4z" className={`district-shape ${activeId === 'jaffna' ? 'active' : ''}`} onClick={() => handleDistrictClick('jaffna')} onMouseEnter={(e) => handleMouseEnter('jaffna', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="kilinochchi" d="M423.6 104.5l3 9 0.4 2.3-2.8 0.2-1.8 0.7-0.3 0.4-0.5 0.8-0.9 0.5-3.1-2.3-1.2-0.2-7.5 0.2-2.1-0.6-16.4-14.3-7-4.6-0.1 0-2.5-1.1 4.9-8.5 3.1-6.7 0-0.1 11 12.1 7.2 4.5 16.6 7.7z m39.9 30.6l-1.1 1.1-0.5 3.9-4.9 3.9-0.7 5.3 0.6 5.3-5.2-2.9-4.6-3.8-1.7-2.2-1.1 0.3-3.2 10.6-3.9 2.1-5.8 0.4-10.5-0.6-3.1 0.1-4 10.1-6.1 0.6-6.2-1.1-6.3 0.1-17.7 2-6 7.9 0.6 6.5-6.1-0.8-4.4 3.3-4.9 2.5-7.9 0.7-1.7 0 1.4-5.7 0-13.6 0.5-2-0.4-1.3-2.7-0.5-6.4-3.3-2.4-2.4-1.6-4.4-0.3-0.8-1.1-5.4-0.1-3.1 2.8-3 5.1-2.5 5.6-1.8 4.7-0.7 2.1-1.1 5-6.7 0.6-0.5 0.9-0.7 1.7-1 2.1-0.8 2.6-0.4-2.2-4-1.3-1.8-1.3-1.8-3.4-3.4-4.5-3.4-17-10-3.5-4.3 7.4 0.2 7.1 2.9 13.9 8.1 13.2 3.3 3.5 2.3 5.5 4.8 1.3 2.5-2.8 1.4 0.6 1.6 0.8 1.6-1.4 1.6 4.8 3.3 11.4-2.8 20.8-8.3 5.7 0.5 12.2 3.4 14.5 6.6 11 2.1z" className={`district-shape ${activeId === 'kilinochchi' ? 'active' : ''}`} onClick={() => handleDistrictClick('kilinochchi')} onMouseEnter={(e) => handleMouseEnter('kilinochchi', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="mannar" d="M366 183.9l0.3 8 1.4 7.6 4.2 6.8 0.5 1.6 0.2 1.8-0.1 3.5-0.9 3.4 0.5 5.5-0.3 4.8-5.1 1.7-1 2.3-0.8 2.6-1.2 2.6-0.8 2.7 1.1 2.1 1.1 1.6-3 8.4 38.1-2 6.2 2.9 3.6 5.7 3.5 9-1.2 8.1-12.3 4.6-13 1.6-8.4-0.9-6.4 3.6-3.5 7.8-5.9 0.6-0.9 3.5 0 3 5.4 4.2 8.8 11.3-22.5 5.9-11.3-0.1-10.2-4.2 1.8 13.7-0.5 21.6-2.2-0.3-1.9-0.9-6.2-3.5-5.9-2.5-6.8-0.6-6.1-2.3-2.6-1.6 0.9-0.9 0.3-1.2 2.3-7.1 0.3-0.3 0.2-0.2 0.5-2 2.2-4.7 2-22.7-5.5-14.5 0.4-2.5 0.4-16.5 0-0.2-0.5-5.6-0.7-2.7-1.2-2-1-2.4 2.2-1.1 3.1-0.6 2-0.6 13.4-12.1 7-3.5 2.9-2.5 1.5-5.7 2.8-5.9 1.5-8.1 7.5-19.2 0.2-1.1 0.7-2.8 1.7 0 7.9-0.7 4.9-2.5 4.4-3.3z m-110.1 37.7l-2.6-1-1.1-2.2 0.7-2.3 3-1 10.3 0 4.6 1.2 4.7 1.2 9.8 3.8 9.4 5.4 7.9 7.7-0.1 0-3.7-0.8-6.7-3.3-3.9-0.7 6 6.8 4.7 5.4 2.1 3.7-5.5-0.7-3.6-2.8-2.5-3-1.9-1.4-2.3-1.2-9.5-8.5-4.7-2.1-4.8-2.2-3.4-0.9-1.8-0.5-5.1-0.6z" className={`district-shape ${activeId === 'mannar' ? 'active' : ''}`} onClick={() => handleDistrictClick('mannar')} onMouseEnter={(e) => handleMouseEnter('mannar', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="vavuniya" d="M498.3 254l-1.9 3.4-1 4-6.3 1.2-6.1 1.8-6.7 4.7-17.1 0.6 0.4 5.1 6 2.1 4.2 5.5 2 6-5.5 4.4-3.3 3.9-2.8 4.3-5 5.9-5.8 5.3-6.2 4.7-7.3 0-3.9-2.8-4.3-2.2-7 3.2-9.1 11.8-4.3 10.1-4.1 1.8-3.5 6.3-2.2-0.1-2.4-0.7-4.9-2.6-2.4-4.9-0.9-3.2-1.5-2.8-3.4-1.6-3.5-1.2-2.3-6.6-0.1-7.5-8.8-11.3-5.4-4.2 0-3 0.9-3.5 5.9-0.6 3.5-7.8 6.4-3.6 8.4 0.9 13-1.6 12.3-4.6 1.2-8.1-3.5-9-3.6-5.7-6.2-2.9 10.7-6.8 6.4-5.2 4.1-6.3-0.2-3.9-0.9-4 0-2.1-0.2-1.9-3.4-0.5-1.8-2.5 0.6-3.4 4.2-0.4 4.4 0.3 8-0.2 5.7 3.6 3.6 5.3 5.6-2.5 4-3.5 2.3-1.1 2.2-1.3 0.4-1.2 0.5-1.1 7.5-0.2 7.2 2.7 0.8 7.5 6.2 0.7 2.7 4.7-2.2 3.3-0.4 3.2 3.6-0.9 3.4-2.3 7.2 1.1 7.4 4.5 2.8 3.7-4.3 15.8z" className={`district-shape ${activeId === 'vavuniya' ? 'active' : ''}`} onClick={() => handleDistrictClick('vavuniya')} onMouseEnter={(e) => handleMouseEnter('vavuniya', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="mullaitivu" d="M534.5 241.9l-3.6 1.6-4.4 1.3-4 2.3-4.5 1.3-10.6 1.4-9.1 4.2 4.3-15.8-2.8-3.7-7.4-4.5-7.2-1.1-3.4 2.3-3.6 0.9 0.4-3.2 2.2-3.3-2.7-4.7-6.2-0.7-0.8-7.5-7.2-2.7-7.5 0.2-0.5 1.1-0.4 1.2-2.2 1.3-2.3 1.1-4 3.5-5.6 2.5-3.6-5.3-5.7-3.6-8 0.2-4.4-0.3-4.2 0.4-0.6 3.4 1.8 2.5 3.4 0.5 0.2 1.9 0 2.1 0.9 4 0.2 3.9-4.1 6.3-6.4 5.2-10.7 6.8-38.1 2 3-8.4-1.1-1.6-1.1-2.1 0.8-2.7 1.2-2.6 0.8-2.6 1-2.3 5.1-1.7 0.3-4.8-0.5-5.5 0.9-3.4 0.1-3.5-0.2-1.8-0.5-1.6-4.2-6.8-1.4-7.6-0.3-8 6.1 0.8-0.6-6.5 6-7.9 17.7-2 6.3-0.1 6.2 1.1 6.1-0.6 4-10.1 3.1-0.1 10.5 0.6 5.8-0.4 3.9-2.1 3.2-10.6 1.1-0.3 1.7 2.2 4.6 3.8 5.2 2.9-0.6-5.3 0.7-5.3 4.9-3.9 0.5-3.9 1.1-1.1 1.2-0.8 1.4-1.2 27.3 22.2 0.2 0.4 1.7 2.7 2.5 3.3 5 4.7 3.1 4-2.7 1.5-0.1 0-1.5-0.7-0.2-0.1-0.1 0-2.4-3.1-1.3-0.7-4.2-0.7-1.8 0.5 0.9 1.9 0.3 0.6 11.9 11.2 4.7 2.6-1.8-2.9-1.1-2.7 0.5-1.9 3.2-0.8 1.5 1 2.5 7.3 2.2 4.4 8.8 17.6-1.8-0.6-4.9-1.9-3 0-1.3 3.3 1.8 0.8 3.7 0.7 3.4 2.1 0 0.3 0.5 5 1.6 0 0.7-1.3 0.7-0.6 0.8-0.4 1.1-0.7 1.1 4.6 0.2 0.6 3.2 7.5 4.4 6.7 4.5 2.9 0.3 0.3 0.5 0.4 0 1.7-1.1 1.6-2.1 0.8-0.6-0.7-2.6-4.1-2.7-1.5-6.3-1.6-3.7-1.7 1.7 2.4 0.9 1.3 8.3 7.8 0 0.8z" className={`district-shape ${activeId === 'mullaitivu' ? 'active' : ''}`} onClick={() => handleDistrictClick('mullaitivu')} onMouseEnter={(e) => handleMouseEnter('mullaitivu', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="batticaloa" d="M534.5 241.9l0.1 3.6 2.7 2-2.4 2.3-2.2 2.6 3.6 2.8 3.9-0.3 3.2-2.9 2.4-4.2 1.5-3.9 0.1 0.1 8.3 10.1 7.4 12.7 3 3.1 4.2 1.3 3.4 2.7 5 12.1 1.2 1.3 1.3 1.4 0.1 0 5.6 2.6 2.9 6 3.2 12.2 0.6-2.2 0.7-0.9 1.3 0.3 2.2 1.2-0.6 2.3 6.4 7 2.1 3.5 0 4.2-1.7 1.7-2.4 1.1-2.2 2.5 0.1 0 1.6-0.4 1.8-0.5 0.4-0.2 0.8-0.5 0.1 0.1 5 10.9 0.7 5.6-5.7 1-0.1 0 1.2-3.8-1.5-3-2.6-0.4-1.8 4 0.6 3.1 1.7 2.2 0.9 2.4-1.7 3.5-1.4-1-2.5-1.9-4-2.5-4-1-3.9 1.7-3 4 1.1 2.1 3.6-0.5 4.8-4 3.3 3.5 2.9 4.2 3.6 3.5 5.1 1.5 10.6-0.2 3.6-2.3-2.4-5.4 6.1-2.8 2.4-0.8 2.5 0.2 0.1 0 2.8 1.6 2.5 2.8 1.9 3.2 1.7 9.3 3.6 12 0.1 3.1 0.1 3.2-2.9-2.1-3.1-6.2-2.7-1.3-0.1 1.7 1.1 7.6 0.1 0.5 1.3 2.9 1.5 0.8 1.4 0.6 0.1 0 3.1 0 2.4 1.2 1.5 8.9 1.8 6.2 0.3 1 0.5 3.8-20.7-2.2-3.9 1.3-3.5 0-2.9 0-2.1 2.3-1.5 2.8-1.8 1.3-1.6 1.4-1.4 6.1-1.2 2.2-3.3 7.6-5.7 1.4-1.2-0.4-0.9-0.7 2.7-1.7 1.2-2.9-0.8-4.4 0.1-3-0.3-2.9-1.7-2.4-2.9 0.3-4.1-2.1-3.7-2.9-3.8-2.2-4.1 0-17.5-4.3-9.7 1-2.9-2.9-0.9-4.9-3.6-2.7-3.7-1.5-2.7-4-3.5 1 5-17.9 0.6-2.9 0.9-2.8 2.9-2.8 3.2-2.2 1.9-3.4-1.5-3.6-2.7-2-2-2.7-3.3-7.7-6.1-9.1-0.9-5.6-2.5-2.4-1.9-2.2-0.2-4.8 3.5-8.3-1.7-4.9-4.3-9.4-0.1-10 3.9-5.8 2.7-6-2.2-1.7-1.9-2.5-3.5-3.9-10.1-7-5.8-3.4-6.8-0.1-6.5 2.6 1-4 1.9-3.4 9.1-4.2 10.6-1.4 4.5-1.3 4-2.3 4.4-1.3 3.6-1.6z" className={`district-shape ${activeId === 'batticaloa' ? 'active' : ''}`} onClick={() => handleDistrictClick('batticaloa')} onMouseEnter={(e) => handleMouseEnter('batticaloa', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="ampara" d="M623.8 412.4l3.9-1.3 20.7 2.2 0.7 2.4 4.8 16.3 1.8 10.6-4.2 5.8-2.3-9.6-0.3-1.4-3.6-9.7-1.6 0-0.3 7.4 0.3 2.3-0.2-0.1-0.2 0.7 0 1.2 0.4 1.4 0.7 0.9 2 0.6 0.4 0.7 1.9 4.9 4 3 3.9-0.3 1.3-5 1.5 0 1.4 2.6 0.4 0.7 1.9 8.4 1.9 3.3 2.6 2.8 1.7 2.7 2.8 6.6 1.1-1.1 1.5-1.1 0.7-1.1 1 2.2-1 1.1 0.5 0.9 0.5 0.5 0 0.1 0.3 0.5 0.1 1.1 0.1-0.1 1.1-0.9 2.4-1.2 1.2-0.9 0.5 1.3 0.7 1.6-0.5 1.9-0.8 1.9 0 1.4 0.1 1.4 1.6 3.2 2.8 2.2 1.9 1.4 1.7 2.8-1.1 0.1-0.5 0.3-0.7 0.5-0.5 0.3-0.4 0.2-0.7 2.6-0.6 2.5 2.7 7.9 1.4 1.7 3.3 3.8 0.1 0 4.8-0.9 1.6 0 1.6 4.9 1.8 3 0.6 0.9 9.9 10.4 3.2 5.1 0.6 4.5-5.1 1.6-2.4-1.6-5.6-7.3-3-2.5-3.8-1.4-0.1 0-0.4 0-2.7 0.2-2.4 2.5-1.6 5.2 2.7 1.2 2.7 0.4 2.3-0.9 1.7-2.3 2.7 1 2.5 1.2 0.9 1.1 0.6 0.7-0.4 2.5 3.1 2.8 3 2.9 2.4 2.8 2.5 4.2-1.2 1.4-0.3 1.3 0.4 1.6 1.1 2.2 1.5-1.8-0.9-3.1 2.7 0.9 5.4 4 1.3 1.8 4.2 10.9-0.3 0.4-1.3 5.9 0.2 0.7 0 0.1 1.1 2.2 0.3 0.9-0.9 1.6-1.7 1.3-1 1.4 1.2 2.1 1.2 1.5 0.3 1.1 0.1 0.2 0.7 1.3 1.7 1.5-2.5 1.8 0.2 0.9-4.4 0.7-6.3 1-4.7 3.8-8.1 8-1.6-3.8-0.7-13.1-1.8-5.7-0.1-5.9-5.4 3.1-15.4 1.6-15.1-2.6-3.9-3.8-7.3-4.4-2.1-3.4-0.5-3.9 2.3-6.8 0.3-6.9-7.3-1.5-7-2-5.1-4.8-7.9-11.5-6.1-2-7.4 0.4-6.3-1.2-3.3-18 2.1-17.9 1.7-6.8 5.2-3.5 6.6-0.9 8.3 1.1 2.2-0.2-1.9-8.6-3.9-8.4-1.7-8.6 1.9-36.7-1.3-12.2z m98.8 139l-0.4-2.5-0.9-1.9-1.1-2.3-0.7-2.3 0.1-2.4 0.7-2.1 0.3-2.3-1.1-2.7 2.9 2.9 2.9 6.7 2 3.1 0.5 1.3 2.2 5.8 5.6 8.9 2.6 4.2 3.9 20.2 0 0.1-0.2 4.6-3.4 2.8-3.2-2.5-1-1.1-0.5-0.5-0.1-1.1-0.2-1.2 0-0.5 1-14.6-0.7-5-2.5-2.2-1-2.1-7.7-11.3z" className={`district-shape ${activeId === 'ampara' ? 'active' : ''}`} onClick={() => handleDistrictClick('ampara')} onMouseEnter={(e) => handleMouseEnter('ampara', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="trincomalee" d="M716.5 818.5l-2.1-0.6-5.6-1.8-3.8-4.4-3-0.4-2.6-0.2-6.9-8.5 6-85.1-1.2-4.6-2.7-4 0-4.5-1.6-4.4 1-4.6 0.5-4.4-6.8-4.1-8.2-2.1-1.2-1.1-1.5-0.8-1.7 0-1.8-0.8-1.8-3.2-1-3.6-2.9-5.5 2.7-7.2 4.8-5.7 3.7-2.9-5-7-0.7-5-3.2-5.6-5.1-4.4-0.9-4.5 0.3-5.6-2.7-12.2 0.4-3.1-1.5-0.3-1.4-0.9 3.4-5.3-4.6-1.2-5.7 3.1-2.8 1-2.6 1.1-0.8 2.2-1.6 2.5-3.2 0.8-2.3 0.2 0 3 1.3 2.7 0.2 2.8-1 2.3-1.6 1.9-1.1 1.6-4.7 2.6-5.7-0.2 0.1 8.9 1.2 8.7-4.3 3.1-4.7 1.6-2-3.8-1.8-4.4-0.8-4.2-2.1-4.2-1.6-2.7-1-2.1-2.8-0.5-2 0.5-3.4-3.4-2.6-5.5-1.5-10.2-0.9-2.9-0.7-2.9 0.6-2.1 1.3-2.4 2.4-11.3-0.8-11.6-10.3-2.2-11.3 6.3-4.9 4.6-2.8 1.1-2.3 0.5-4.2 1.5-5.7-9.5-1.8-5.6-0.3-3.8-1.5-3.3-3.5-2.1-0.6-0.6 2.2-11.1-0.5-4.4-1.7-5.3 0.2-3.9 4.3 0 8.6-0.8 4.2-0.7 8.4 3.2 6.8 6.8 11.2 3.5 5.4 3.1 4.5 0.6 0.6-2.4 1-2.8 1.5-1.5 1.3-2.5-0.7-5.5 1-5.2 6.3 1.2 7.4-0.4 6.1 2 7.9 11.5 5.1 4.8 7 2 7.3 1.5-0.3 6.9-2.3 6.8 0.5 3.9 2.1 3.4 7.3 4.4 3.9 3.8 15.1 2.6 15.4-1.6 5.4-3.1 0.1 5.9 1.8 5.7 0.7 13.1 1.6 3.8 8.1-8 4.7-3.8 6.3-1 4.4-0.7 0.2 0.9 1.9 0.4 1.9-2.4 1.4 0 1.8 9.4-0.1 3.4 1.6 0 0-0.1 0.2-3.2 0.6-3.2 0.9-2.8 1.5-1.9 0-1.6-0.2-0.4-0.5-1.4 0.4-0.8 1.3 0.6 2.1 2 0.7 1.8 0.5 5 3.6 5.6 5.7 19.8-1.1 54.6 0.6 3.7 2.4 8.2 0.3 4.8-1.3 9.3-10.6 36.8-0.6 3.8-0.2 5-0.8 4.2-3.3 6.5-0.8 2.9-1.3 4-4.4 7-2.1 3.3 1.5 5.6-2.5 6.7-14.6 23.2z" className={`district-shape ${activeId === 'trincomalee' ? 'active' : ''}`} onClick={() => handleDistrictClick('trincomalee')} onMouseEnter={(e) => handleMouseEnter('trincomalee', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="kurunegala" d="M308.3 641.1l-0.6-13.8-8.5-45.8-0.4-8 0.4-8 2.5-6.4 3.5-5.9 0.9-2.7 1.6-2.3 3.3-0.8 2.8-1.5-1.3-2.2-2.8-0.7 1.1-3 1.6-2.7 3-0.9 3.3-0.3 2.5-1 1.6-2.2-0.9-2.4-1.2-2.6 0.7-6.2 2.2-5.6 0.4-2.8 0.9-2.5 3-1.6 2.8-1.9 0.6-2.5 1.1-2.4 4.9-2.5 0.9-2.1 0.4-2.4 1.4-3.2 3.4-1.6-0.2 0.4-0.2 0.4 1.4-0.4 1.8-1.9 0.1-2.8 1.3-2.3 4.8 2.7 2.9-2.2-2.8-5.2 1.4-2.7 1.7-2.6 0.2-5.3-0.2-6.3 0.9-3 0.6-2.8-2.7-1.8-3.2-1.1-2.2-4.1-0.8-4.6-2.4-9.2 0.1-4.7-0.5-4.4 5 2.8 21.3 9.7 4.5 1.2 4.4 1.8 3.5 2.4 4.2 0.7 7.7 2.9 6.9 5.7 3.8 3.8 4.2 2.6 4.3-0.2 3.5 2.9 0 2.9-0.4 2.9 0.7 5-0.3 4.2 0.4 4.1 3.2 1.3 3.8 0.3 1.9 3.2 0.6 3.9 2.1 5.4 1.2 5.5-0.9 8.1 5.9 5.6-1.1 3.8 0.6 4.1 2 1.1 1.8 0.5 1.6 3.7 2.3 3.8 1.6 4 0 4 0.9 0.6 1.1 1.7 0.7 7.7 1.3 7.2 4.2 4.2-0.1 2.7-0.7 2.7 0.1 2.1-0.8 2-3.3 3-0.6 4.9 2.3 4.7 1.4 2.3 1.2 2.5 0.7 2.9-0.5 2.8-1.3 1.7-0.1 2.4-2.8 1.3-2.7 0.7 1.9 3 1.3 3.1-2.4 1.2-3.4-0.5-3.3 1.8 0.3 2.6-0.3 2.4-4-0.3-3.5-2.5-3.4 0-0.7 4.6-1 1.3-0.8 1.4 0.2 1.5 0.4 1.1-4.1 1.2-4.8-0.5-2.1-4.5-3.4-3.5-5.5-0.7-5.1 2-0.8 4.4 0.3 4.8-0.8 2.7-1.6 2.3-2.5 0.1-11.3 2.5-5.4 2.5-5 3.6-4.8 4.3-4.7 2.7-4-2.9-5.7-6.6-1.4-1.9-0.6-2-2.1-2.3-6.4 1.2-5.7 4-6.6 1.9-6.4-4.4-5.5 0.2-8.8 6.9-4.9 1.9z" className={`district-shape ${activeId === 'kurunegala' ? 'active' : ''}`} onClick={() => handleDistrictClick('kurunegala')} onMouseEnter={(e) => handleMouseEnter('kurunegala', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="puttalam" d="M301.7 339.1l2.6 1.6 6.1 2.3 6.8 0.6 5.9 2.5 6.2 3.5 1.3 9.6-4.2 8.9-7.2 5.9-0.3 1.7-1 2.1-3.9 1.8-2.6 5.7 3.4 6.6 5.8 23.4 1.4 4.2 4.8 0 3.9-1.8 4.1 3.1 4.7-0.2 3.4 2.8 2.5 3.3 0.5 4.4-0.1 4.7 2.4 9.2 0.8 4.6 2.2 4.1 3.2 1.1 2.7 1.8-0.6 2.8-0.9 3 0.2 6.3-0.2 5.3-1.7 2.6-1.4 2.7 2.8 5.2-2.9 2.2-4.8-2.7-1.3 2.3-0.1 2.8-1.8 1.9-1.4 0.4 0.2-0.4 0.2-0.4-3.4 1.6-1.4 3.2-0.4 2.4-0.9 2.1-4.9 2.5-1.1 2.4-0.6 2.5-2.8 1.9-3 1.6-0.9 2.5-0.4 2.8-2.2 5.6-0.7 6.2 1.2 2.6 0.9 2.4-1.6 2.2-2.5 1-3.3 0.3-3 0.9-1.6 2.7-1.1 3 2.8 0.7 1.3 2.2-2.8 1.5-3.3 0.8-1.6 2.3-0.9 2.7-3.5 5.9-2.5 6.4-0.4 8 0.4 8 8.5 45.8 0.6 13.8-4-1.6-3.4 2.2-2.7-0.4-1.8-2-4.5 0.6-4.3 1.1-5.5-0.2-9.9-73-1.4-3 0.9-1 0.7-0.1 1.7 1.1 0.4-4 1.1-4.7 0.3-2.2 0.3-2.3-1.3-3.5-1.8-3.2-0.3-2.1-0.3-2.1 0-8.6-5.3-26.1-0.7-3-2.7-5.7-2.3-12.1-3.8-9.5-5.8-26.2 0-7.5 1 0.5 0.1 0.1 0 0.2 0.5 0.8 0.8-4.3-1.2-13.8-1.2-4.1 3.8-2.5 3.6-4.7 2.6-5.3 1-4.4 1.1-2.9 6.8-10.8-0.1 0.2-3.4 8.2-4.4 7.7 1 1.9 0.2 0.4 1.7 1.8 2.2 0.8 2.8 0-2.3 6.4-2.3 4.6-1 0.8-1.1 0.1-0.8 0.7-0.4 2.4 0.2 5.6-0.2 1.7-3.9 12.4 0.2 2.4 0.3 4.6 4 4.8 1.1 1.3-4.6 9.7 7.4 5.4 10.7 0.8 5.4-3.9-1-4.1-1.8-3.2-0.6-1.3-0.9-1-2-2.6-2.3-1.5-0.7-2.5 7.8-14.8-0.3-2.7-1-2-1.2-1.7-0.7-1.7-0.2-2.8 0.3-4.9-0.1-1.9 0-0.1-0.1-0.4-0.6-1.6-0.4-0.4-0.5-0.4-0.4-1 0.4-2.6 1.1-2.2 3-3.9 0.7-2.6 0.5-4.9 2.1-9.7 2.2-22.8 1.4-2.6 1.5-1.3 1.2-1.5 0.5-3.4 0-9.7 1.3-4.8 3.1-3 3.8-2.6 2.1-2.3z" className={`district-shape ${activeId === 'puttalam' ? 'active' : ''}`} onClick={() => handleDistrictClick('puttalam')} onMouseEnter={(e) => handleMouseEnter('puttalam', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="anuradhapura" d="M495.4 261.4l6.5-2.6 6.8 0.1 5.8 3.4 10.1 7 3.5 3.9 1.9 2.5 2.2 1.7-2.7 6-3.9 5.8 0.1 10 4.3 9.4 1.7 4.9-3.5 8.3 0.2 4.8 1.9 2.2 2.5 2.4 0.9 5.6 6.1 9.1 3.3 7.7 2 2.7 2.7 2 1.5 3.6-1.9 3.4-3.2 2.2-2.9 2.8-0.9 2.8-0.6 2.9-5 17.9-2.9 3.1-1.8 4.1-0.9 4.1-3 1.8-10.2 0-9.1 1.7-3.4 8.9-1.9 9.8-3.3 8.8-1.6 9.1-0.4 8.1 4.6 3.6-4.5 6.4-0.3 6.1-4.8 2-4.4 2.2-3 2.6-4.5 4.7-1.3 1-1.7-0.5-2.4 0-1.2 3.8 0 4.3-2.2 3.4-3 3 0.6 1.1 0.1 1.7-1.5 0.8-1.6 1.2-1.7 2.8-3.4 2.3-2.8-1.8-3.7-0.1-4.1 4.9-7.7 2.9-4.9 3.6-5.9-5.6 0.9-8.1-1.2-5.5-2.1-5.4-0.6-3.9-1.9-3.2-3.8-0.3-3.2-1.3-0.4-4.1 0.3-4.2-0.7-5 0.4-2.9 0-2.9-3.5-2.9-4.3 0.2-4.2-2.6-3.8-3.8-6.9-5.7-7.7-2.9-4.2-0.7-3.5-2.4-4.4-1.8-4.5-1.2-21.3-9.7-5-2.8-2.5-3.3-3.4-2.8-4.7 0.2-4.1-3.1-3.9 1.8-4.8 0-1.4-4.2-5.8-23.4-3.4-6.6 2.6-5.7 3.9-1.8 1-2.1 0.3-1.7 7.2-5.9 4.2-8.9-1.3-9.6 1.9 0.9 2.2 0.3 0.5-21.6-1.8-13.7 10.2 4.2 11.3 0.1 22.5-5.9 0.1 7.5 2.3 6.6 3.5 1.2 3.4 1.6 1.5 2.8 0.9 3.2 2.4 4.9 4.9 2.6 2.4 0.7 2.2 0.1 3.5-6.3 4.1-1.8 4.3-10.1 9.1-11.8 7-3.2 4.3 2.2 3.9 2.8 7.3 0 6.2-4.7 5.8-5.3 5-5.9 2.8-4.3 3.3-3.9 5.5-4.4-2-6-4.2-5.5-6-2.1-0.4-5.1 17.1-0.6 6.7-4.7 6.1-1.8 6.3-1.2z" className={`district-shape ${activeId === 'anuradhapura' ? 'active' : ''}`} onClick={() => handleDistrictClick('anuradhapura')} onMouseEnter={(e) => handleMouseEnter('anuradhapura', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="polonnaruwa" d="M534.8 393.9l3.5-1 2.7 4 3.7 1.5 3.6 2.7 0.9 4.9 2.9 2.9 9.7-1 17.5 4.3 4.1 0 3.8 2.2 3.7 2.9 4.1 2.1 2.9-0.3 1.7 2.4 0.3 2.9-0.1 3 0.8 4.4-1.2 2.9-2.7 1.7 0.9 0.7 1.2 0.4 5.7-1.4 3.3-7.6 1.2-2.2 1.4-6.1 1.6-1.4 1.8-1.3 1.5-2.8 2.1-2.3 2.9 0 3.5 0 1.3 12.2-1.9 36.7 1.7 8.6 3.9 8.4 1.9 8.6-2.2 0.2-8.3-1.1-6.6 0.9-5.2 3.5-1.7 6.8-2.1 17.9 3.3 18-1 5.2 0.7 5.5-1.3 2.5-1.5 1.5-1 2.8-0.6 2.4-4.5-0.6-5.4-3.1-11.2-3.5-6.8-6.8-8.4-3.2-4.2 0.7-8.6 0.8-4.3 0-12 2.2-12.3-0.8-0.5 4.1-1 4.1-3.6-2.2-2-2.8-4.5 4.2-5.8 2.4-6.1-1.3-2.3-3.2 0.4-4.6-3.1-14.1 1.6-6.4 6.7-1.5 0.4-1.7 0.8-1.6 2.2-9.4 0.6-5.4 2.3-11 6.9-7.2-3.4-2.1-3.6-0.7-2.7-0.8-2.8 1.3-0.1 1.5-1.5 1-1.9-0.8-1.3-1.3 0.1-4.1-3.2-3.6-2-2 0.3-6.1 4.5-6.4-4.6-3.6 0.4-8.1 1.6-9.1 3.3-8.8 1.9-9.8 3.4-8.9 9.1-1.7 10.2 0 3-1.8 0.9-4.1 1.8-4.1 2.9-3.1z" className={`district-shape ${activeId === 'polonnaruwa' ? 'active' : ''}`} onClick={() => handleDistrictClick('polonnaruwa')} onMouseEnter={(e) => handleMouseEnter('polonnaruwa', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="badulla" d="M549.6 562l0.6 0.6 3.5 2.1 1.5 3.3 0.3 3.8 1.8 5.6 5.7 9.5 4.2-1.5 2.3-0.5 2.8-1.1 4.9-4.6 11.3-6.3 10.3 2.2 0.8 11.6-2.4 11.3-1.3 2.4-0.6 2.1 0.7 2.9 0.9 2.9 1.5 10.2 2.6 5.5 3.4 3.4 2-0.5 2.8 0.5 1 2.1 1.6 2.7 2.1 4.2 0.8 4.2-9 2.1 0 4.8-1.8 4.4-6.3 8-2.1 3.6-3.8 1.6-3.2-3.5-3.8-0.5-2.7 4.1-0.7 4.7 2.9 3.7 3.5 3.5 2.3 4.8 2.7 2.8 8.5-2.2 2.5 3.2 1.2 1.1 1.7 2.1 1.2 3.1 0.7 3.2 0 4.3-1.1 4.2-0.9 6.4-1.2 2.6-1.6 2.4-0.6 3.6-1.1 3.4-3 0.6-2.3-1-1.4 1.4-1.1 1.9-2.3 2.9-2.9 2.4-5.9 1.6-4.9 2.7 5.6 7.9-6.7 2-2 3.9-7.8 0.7-0.6 4.9 0.5 5-2 4.2 0.9 3 4.1 1.1 0.3 4.1-3.4 5.3-0.5 3.4 0 3.6 2.2 6.4 3.4 5.4-4.8 1.7-0.7 5.5-2.5-1.2-2.5-1.6-3.3 5.1-0.9 6.2-2-3.3-2.6-3.3-1-7.4-1.6-0.9-1.6-0.8-1.6-5.1-2.1-4.7-1.9-0.4-1.8-1-1.1-4-1.7-2.7-2.8-0.2-4.2 0.2-4.7 3.5-5.5 2.3-5.3-1-3.5-2.9-2.5-3.8 1.1-3.1 6.3-2.8 0.9-0.9 0.7-1.8 0.5-2.2-3.9-1.2-3.2-3.5-1.7 0.7-1.7 0.8-0.6-8.5 4.4-1.1 2.3-3.4-2.1-1-2.1-1.4 3.4-5.5-0.9-1.6-1.2-1.4-1.3-3.6-1.6-3.2-7.3-3.7-0.3-3.7 4.2-0.2 4.3 0.2 3.1-3.5 1.1-4.6 3.7-3.4 4.1-2 8.8-1.9 5.1-7.6 1-4.5 2.1-4.1 1.9-1.7 1.5-2 0.8-1.7-0.4-1.6-1.2-4.1 1.1-2.1 1.6-2-0.9-1.2-1-1.2-0.5-2 0.5-2.1-1.7-5.8 0.2-4.2 2.9-1.8 4.9-1.4 6.2-5.7 0.4-7.6-5-16.8-2-35.1-1.2-19 2.3-10.9z" className={`district-shape ${activeId === 'badulla' ? 'active' : ''}`} onClick={() => handleDistrictClick('badulla')} onMouseEnter={(e) => handleMouseEnter('badulla', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="monaragala" d="M692.5 802.6l-4.1 4.9-6.2 1.1-4.9 3.7-4.2 4.1-5.5 2.4-4.5 3.7 0.1 3.9 1.1 3.1-1 1.7-1 1.4 0.1 1.9 0 2-3 4.9-6.4-1.4-6.1 2.2-2.1-0.3-0.5-0.6-2.6 1.8-13.7 5.3-6.7 1.8-3.5 1.4-2.3 2.3-6.3 3.5-5.7-2.4-3.6-6-4.3-5.7-2.9 0.4-2.1 1.5-2.5 0.1-2.3-0.4-1.7-4.2-3.9-1.4-5.8-0.7-5.8 0-2.1 2.5-2.9-2 0.1 3.1-1.9 2.6-3.2 0.3-2.9 0-1.1 5.2 2.2 5.2-5 3.8-6.5 2.1-5.8 3.2-5.7 3.7-1.8-5.4-2.2-4.2-4.2-3-4.4-2.4-3.3-4.3-2.5-5-0.2-14.3-1.5-3.7-0.7-3.8 3.5-6.6 4.4-6.2 2.2-10 2.2-5.2 4.3-5.1 2.3-5.9 3.8-5.8 2.8 0.2 1.7 2.7 1.1 4 1.8 1 1.9 0.4 2.1 4.7 1.6 5.1 1.6 0.8 1.6 0.9 1 7.4 2.6 3.3 2 3.3 0.9-6.2 3.3-5.1 2.5 1.6 2.5 1.2 0.7-5.5 4.8-1.7-3.4-5.4-2.2-6.4 0-3.6 0.5-3.4 3.4-5.3-0.3-4.1-4.1-1.1-0.9-3 2-4.2-0.5-5 0.6-4.9 7.8-0.7 2-3.9 6.7-2-5.6-7.9 4.9-2.7 5.9-1.6 2.9-2.4 2.3-2.9 1.1-1.9 1.4-1.4 2.3 1 3-0.6 1.1-3.4 0.6-3.6 1.6-2.4 1.2-2.6 0.9-6.4 1.1-4.2 0-4.3-0.7-3.2-1.2-3.1-1.7-2.1-1.2-1.1-2.5-3.2-8.5 2.2-2.7-2.8-2.3-4.8-3.5-3.5-2.9-3.7 0.7-4.7 2.7-4.1 3.8 0.5 3.2 3.5 3.8-1.6 2.1-3.6 6.3-8 1.8-4.4 0-4.8 9-2.1 1.8 4.4 2 3.8 4.7-1.6 4.3-3.1-1.2-8.7-0.1-8.9 5.7 0.2 4.7-2.6 1.1-1.6 1.6-1.9 1-2.3-0.2-2.8-1.3-2.7 0-3 2.3-0.2 3.2-0.8 1.6-2.5 0.8-2.2 2.6-1.1 2.8-1 5.7-3.1 4.6 1.2-3.4 5.3 1.4 0.9 1.5 0.3-0.4 3.1 2.7 12.2-0.3 5.6 0.9 4.5 5.1 4.4 3.2 5.6 0.7 5 5 7-3.7 2.9-4.8 5.7-2.7 7.2 2.9 5.5 1 3.6 1.8 3.2 1.8 0.8 1.7 0 1.5 0.8 1.2 1.1 8.2 2.1 6.8 4.1-0.5 4.4-1 4.6 1.6 4.4 0 4.5 2.7 4 1.2 4.6-6 85.1z" className={`district-shape ${activeId === 'monaragala' ? 'active' : ''}`} onClick={() => handleDistrictClick('monaragala')} onMouseEnter={(e) => handleMouseEnter('monaragala', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="ratnapura" d="M363.2 748.2l5.1-4.6-5.7-6 1.2-2.8 1-3.2 2.5-4 2.9-3.6 3.6-1.6 9.6 9.7 2.8 3.7 3.6 2.7 1.6-0.9 2.4-0.5 1.6 2 1.1 2.3 5.8 1.3 7-4 2.9-0.3 3.5 0.1 4.9 2.8 6.4 2.2 4.5 0.6 4.6-0.1-0.1 3.8 1.5 1.7-1.7 1.6-0.9 2.4 4.8 3.6 5.6 0.5 12 2.7 12.6 1.7 4.9-0.8 5.7-0.5 7.6 0.3 7.2-1 13.1-6.8 0.6 8.5 1.7-0.8 1.7-0.7 3.2 3.5 3.9 1.2-0.5 2.2-0.7 1.8-0.9 0.9-6.3 2.8-1.1 3.1 2.5 3.8 3.5 2.9 5.3 1 5.5-2.3 4.7-3.5 4.2-0.2-3.8 5.8-2.3 5.9-4.3 5.1-2.2 5.2-2.2 10-4.4 6.2-3.5 6.6 0.7 3.8 1.5 3.7 0.2 14.3 2.5 5 3.3 4.3 4.4 2.4 4.2 3 2.2 4.2 1.8 5.4 4.3 4.7 2.1 5.9-1.1 4.1-4.9-1.6-8.4-1.7-2.7-3.1-3.5-2.8-4.4 0.4-4.4 1.1-4.5-0.7-16.9-6.1-13.1-2.6 0-2.2 1.2-1.2-3-2.2 0.2-2.2-2.6-3.2-5.5 0.9-4.1-0.7 1.5-4.1-3.3-6.2-10.2 1.4-3.9 0-1.6 3.8-4.5 1-4.5 0.7-2-2.9-3.7 0.1-7.2-3.5-3.4-0.1-3.9-1.6-3.2-2.7-2.8-2.9-8.3-14.5-9.7-13.7-1.3-3.9 3.5-1.4-3.3-6.4-5.2-4.7-3.2-1.2-2.5-2.4-1.4-6.8-7-6.8-2.3-4.6-1.4-4.4 0.3-3.7-4-10.7-0.8-4.7z" className={`district-shape ${activeId === 'ratnapura' ? 'active' : ''}`} onClick={() => handleDistrictClick('ratnapura')} onMouseEnter={(e) => handleMouseEnter('ratnapura', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
<path id="kegalle" d="M363.2 710l0.7-1.9-0.1-2.1-3.4-11 1.2-6.8 2.9-6.7 3.4-2.4 1.7-3.9-4.9-1.4-5.6 1.3-2.8-5.8 1-6.6 3.6-1.9 3-2.8 0.6-8 2.3-1.8-0.4-3.1 4.7-2.7 4.8-4.3 5-3.6 5.4-2.5 11.3-2.5 2.5-0.1 1.6-2.3 0.8-2.7-0.3-4.8 0.8-4.4 5.1-2 5.5 0.7 3.4 3.5 2.1 4.5 2.8 7.1 10 8.7-0.4 4.5 2 1.4 5.8 3.3 2.8 3.4-0.5 4.1 0 3.4 3.4 3.3 2.6 3.4-1.3 3.1-1.8 2.8-2.5 0.6-2.5 0.2-3.6 3.9-8 1.3-2.6 2.4 3.5 8.4 1.6 2.9-1.6 3.6-0.2 4.6 0.3 0.7 0.8 0.2-2 3.3-3.2 2.8-1.8 0.6-1.2 1.8 1.2 1.7 1.5 1.5-1.6 8.7 2 6.7 6.7 2.1 5.3 4 1.8 6.1 0.4 3.1-2.7 2.4-4.6 0.1-4.5-0.6-6.4-2.2-4.9-2.8-3.5-0.1-2.9 0.3-7 4-5.8-1.3-1.1-2.3-1.6-2-2.4 0.5-1.6 0.9-3.6-2.7-2.8-3.7-9.6-9.7-3.6 1.6-0.1-2.3-0.3-2.2 3.1-2.9-0.7-4.2-4-2-5-0.4z" className={`district-shape ${activeId === 'kegalle' ? 'active' : ''}`} onClick={() => handleDistrictClick('kegalle')} onMouseEnter={(e) => handleMouseEnter('kegalle', e)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
                          </g>
                      </g>
                  </svg>
                </div>
                
                {/* Tooltip */}
                <div 
                    className={`map-tooltip ${tooltip.show ? 'show' : ''}`} 
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    {tooltip.text}
                </div>
              </div>

                <div className="infocard">
                <div className="info-head">
                  <div className="badge">{activeId ? (activeHighlight ? 'Place Selected' : 'District selected') : 'Select a district'}</div>
                  <h2 className="info-title">
                      {activeHighlight ? activeHighlight.title : (activeDistrict?.name || 'Sri Lanka')}
                  </h2>
                  <p className="info-sub mb-3">
                      {activeHighlight ? activeHighlight.detail : (activeDistrict?.blurb || 'Click any district to see suggested places to see.')}
                  </p>
                  
                  {/* District Map Link */}
                  {activeDistrict && !activeHighlight && (
                       <a 
                          href={activeDistrict.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeDistrict.name + " Sri Lanka")}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-500/20 hover:bg-emerald-900/50 transition-colors"
                       >
                           <MapPin className="w-3 h-3" /> Get Directions
                       </a>
                  )}
                  {/* Highlight Map Link */}
                  {activeHighlight && (
                       <a 
                          href={activeHighlight.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeHighlight.title + " " + activeDistrict?.name)}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-500/20 hover:bg-emerald-900/50 transition-colors"
                       >
                           <MapPin className="w-3 h-3" /> Get Directions to Highlight
                       </a>
                  )}
                </div>

                {activeDistrict && (
                    <>
                        <div className="selection-hero relative group">
                        <img 
                            src={displayImage || activeDistrict.image} 
                            alt={activeDistrict.name} 
                            key={displayImage || activeDistrict.image} // Force animation restart
                        />
                        {activeHighlight && (
                            <>
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-white border border-white/10 animate-fade-in z-10">
                                    Featured Highlight
                                </div>
                                <a 
                                    href={activeHighlight.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeHighlight.title + " " + activeDistrict?.name)}`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="absolute bottom-3 right-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 z-10"
                                >
                                    <MapPin className="w-3 h-3" /> Navigate
                                </a>
                            </>
                        )}
                        </div>

                        <div className="spots grid grid-cols-1 gap-2">
                            {activeDistrict.highlights.map((h: any, i: number) => (
                                <div 
                                    key={i} 
                                    className={`spot group transition-all duration-300 cursor-pointer rounded-lg p-3 border border-transparent ${activeHighlight === h ? 'bg-emerald-900/40 border-emerald-500/30' : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10'}`}
                                    onClick={() => handleSpotClick(h)}
                                    title="Click to view details & reviews"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {Boolean(h.averageRating && h.averageRating > 0) && (
                                            <div className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-500/20">
                                                <Star className="w-3 h-3 fill-amber-500" />
                                                {h.averageRating.toFixed(1)}
                                            </div>
                                        )}
                                        <h4 className={`text-sm font-bold leading-tight ${activeHighlight === h ? 'text-emerald-400' : 'text-slate-200 group-hover:text-emerald-400'}`}>{h.title}</h4>
                                    </div>
                                    <div className="flex justify-between items-end gap-2">
                                        <p className="text-xs text-slate-500 line-clamp-2 flex-grow">{h.detail}</p>
                                        <a 
                                            href={h.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.title + " " + activeDistrict?.name)}`}
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-emerald-500 hover:text-emerald-400 p-1.5 bg-emerald-500/10 rounded-md hover:bg-emerald-500/20 transition-colors"
                                            title="Get Directions"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                           <MapPin className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>

                  {/* District Reviews Section */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {`Reviews for ${activeDistrict.name}`}
                        </h4>
                        <div className="text-xs text-slate-500">
                             {activeDistrict.reviews?.length || 0} Reviews
                        </div>
                      </div>

                      {/* Review Form (District) */}
                      <form onSubmit={handleSubmitReview} className="mb-8 bg-white/5 p-4 rounded-xl border border-white/5 shadow-lg backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-3">
                              <label className="text-xs font-semibold text-slate-300">Rate {activeDistrict.name}</label>
                              <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                          key={star}
                                          type="button"
                                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                          onMouseEnter={() => setHoverRating(star)}
                                          onMouseLeave={() => setHoverRating(0)}
                                          onClick={() => handleRate(star)}
                                      >
                                          <Star 
                                              className={`w-6 h-6 ${star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-slate-600'}`} 
                                          />
                                      </button>
                                  ))}
                              </div>
                          </div>
                          
                          <textarea
                              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 min-h-[80px] transition-all placeholder:text-slate-600 resize-none"
                              placeholder="Share your experience... what did you like the most?"
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                          />
                          <div className="flex justify-end mt-2">
                            <button 
                                type="submit" 
                                disabled={reviewSubmitting || rating === 0}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-[1px]"
                            >
                                {reviewSubmitting ? 'Posting...' : 'Post Review'}
                            </button>
                          </div>
                      </form>

                      {/* Review List (District) */}
                      <div className="space-y-3">
                          {activeDistrict.reviews?.length > 0 ? (
                              activeDistrict.reviews.slice().reverse().map((review: Review, idx: number) => (
                                  <div key={idx} className="bg-black/20 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center gap-3">
                                              {/* Avatar */}
                                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-950 border border-white/10 flex items-center justify-center text-xs font-bold text-emerald-400 shadow-inner overflow-hidden">
                                                  {review.avatarProvider && review.avatarSeed ? (
                                                      <img 
                                                        src={getAvatarUrl(review.avatarProvider, review.avatarSeed)!} 
                                                        alt={review.userName} 
                                                        className="w-full h-full object-cover" 
                                                      />
                                                  ) : review.userImage ? (
                                                      <img src={review.userImage} alt={review.userName} className="w-full h-full rounded-full object-cover" />
                                                  ) : (
                                                    review.userName.charAt(0).toUpperCase()
                                                  )}
                                              </div>
                                              <div>
                                                  <div className="text-xs font-bold text-slate-200">{review.userName}</div>
                                                  <div className="text-[10px] text-slate-500">
                                                      {new Date(review.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              <div className="flex text-amber-500 text-[10px] bg-black/30 px-2 py-1 rounded-full border border-white/5">
                                                  {[...Array(5)].map((_, i) => (
                                                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-700'}`} />
                                                  ))}
                                              </div>
                                              {user && user.uid === review.userId && (
                                                  <button 
                                                      onClick={() => handleDeleteReview(review)}
                                                      className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-white/5 transition-colors"
                                                      title="Delete Review"
                                                  >
                                                      <Trash2 className="w-3 h-3" />
                                                  </button>
                                              )}
                                          </div>
                                      </div>
                                      <p className="text-sm text-slate-300 pl-11 leading-relaxed">"{review.comment}"</p>
                                  </div>
                              ))
                          ) : (
                              <div className="flex flex-col items-center justify-center py-10 text-slate-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                                  <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                                  <div className="text-xs font-medium">No reviews yet</div>
                                  <div className="text-[10px] opacity-70">Be the first to share your experience!</div>
                              </div>
                          )}
                      </div>
                  </div>
                    </>
                )}
              </div>
            </div>
          </section>
          {/* Highlight Modal */}
          {activeHighlight && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => {
                  setActiveHighlight(null);
                  if (activeId && districtData[activeId]) {
                      setDisplayImage(districtData[activeId].image);
                  }
              }}>
                  <div className="bg-[#0f1715] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => {
                            setActiveHighlight(null);
                            if (activeId && districtData[activeId]) {
                                setDisplayImage(districtData[activeId].image);
                            }
                        }}
                        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                      >
                          ✕
                      </button>

                      {/* Header Image */}
                      <div className="h-48 md:h-64 relative shrink-0">
                          <img 
                              src={displayImage} 
                              alt={activeHighlight.title}
                              className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1715] via-transparent to-transparent"></div>
                          <div className="absolute bottom-4 left-6">
                              <h2 className="text-3xl font-serif font-bold text-white drop-shadow-md">{activeHighlight.title}</h2>
                              <div className="flex items-center gap-2 mt-1">
                                  <div className="flex text-amber-500">
                                      <Star className="w-4 h-4 fill-amber-500" />
                                  </div>
                                  <span className="text-amber-200 font-bold">{activeHighlight.averageRating?.toFixed(1) || 'New'}</span>
                              <span className="text-slate-400 text-xs">({activeHighlight.reviews?.length || 0} reviews)</span>
                              </div>
                          </div>
                           <a 
                                href={activeHighlight.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeHighlight.title + " " + activeDistrict?.name)}`}
                                target="_blank" 
                                rel="noreferrer"
                                className="absolute bottom-4 right-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 z-20"
                            >
                                <MapPin className="w-3 h-3" /> Navigate
                            </a>
                      </div>

                      {/* Content Scroll */}
                      <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                          <p className="text-slate-300 leading-relaxed mb-8 text-sm md:text-base">
                              {activeHighlight.detail}
                          </p>

                          {/* Highlight Reviews Section */}
                          <div className="border-t border-white/10 pt-6">
                              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Reviews</h3>
                              
                              {/* Highlight Review Form */}
                              <form onSubmit={handleSubmitReview} className="mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                                  <div className="flex items-center justify-between mb-3">
                                      <label className="text-xs font-semibold text-slate-300">Rate this place</label>
                                      <div className="flex items-center gap-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                              <button
                                                  key={star}
                                                  type="button"
                                                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                                  onMouseEnter={() => setHoverRating(star)}
                                                  onMouseLeave={() => setHoverRating(0)}
                                                  onClick={() => handleRate(star)}
                                              >
                                                  <Star 
                                                      className={`w-6 h-6 ${star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-slate-600'}`} 
                                                  />
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                                  
                                  <textarea
                                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 min-h-[80px] transition-all placeholder:text-slate-600 resize-none"
                                      placeholder="Share your thoughts..."
                                      value={reviewText}
                                      onChange={(e) => setReviewText(e.target.value)}
                                  />
                                  <div className="flex justify-end mt-2">
                                    <button 
                                        type="submit" 
                                        disabled={reviewSubmitting || rating === 0}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {reviewSubmitting ? 'Posting...' : 'Post Review'}
                                    </button>
                                  </div>
                              </form>

                              {/* Highlight Reviews List */}
                              <div className="space-y-3">
                                  {activeHighlight.reviews?.length > 0 ? (
                                      activeHighlight.reviews.slice().reverse().map((review: Review, idx: number) => (
                                          <div key={idx} className="bg-black/20 p-4 rounded-xl border border-white/5">
                                              <div className="flex justify-between items-start mb-2">
                                                  <div className="flex items-center gap-3">
                                                      <div className="w-8 h-8 rounded-full bg-emerald-900/50 border border-white/10 flex items-center justify-center text-xs font-bold text-emerald-400">
                                                          {review.userImage ? (
                                                              <img src={review.userImage} alt={review.userName} className="w-full h-full rounded-full object-cover" />
                                                          ) : (
                                                              review.userName.charAt(0).toUpperCase()
                                                          )}
                                                      </div>
                                                      <div>
                                                          <div className="text-xs font-bold text-slate-200">{review.userName}</div>
                                                          <div className="text-[10px] text-slate-500">
                                                              {new Date(review.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                          </div>
                                                      </div>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                      <div className="flex text-amber-500 text-[10px] bg-black/30 px-2 py-1 rounded-full border border-white/5">
                                                          {[...Array(5)].map((_, i) => (
                                                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-700'}`} />
                                                          ))}
                                                      </div>
                                                      {user && user.uid === review.userId && (
                                                          <button 
                                                              onClick={() => handleDeleteReview(review)}
                                                              className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-white/5 transition-colors"
                                                              title="Delete Review"
                                                          >
                                                              <Trash2 className="w-3 h-3" />
                                                          </button>
                                                      )}
                                                  </div>
                                              </div>
                                              <p className="text-sm text-slate-300 pl-11 leading-relaxed">"{review.comment}"</p>
                                          </div>
                                      ))
                                  ) : (
                                      <div className="flex flex-col items-center justify-center py-6 text-slate-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                                          <MessageCircle className="w-6 h-6 mb-2 opacity-50" />
                                          <div className="text-xs">No reviews for this spot yet.</div>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}
        </main>

           {/* Notification Toast */}
           {notification && (
               <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-top-4 duration-300 ${
                   notification.type === 'success' ? 'bg-emerald-900/80 border-emerald-500/30 text-emerald-100' :
                   notification.type === 'error' ? 'bg-red-950/80 border-red-500/30 text-red-100' :
                   'bg-blue-950/80 border-blue-500/30 text-blue-100'
               }`}>
                   {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                   {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                   {notification.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                   <span className="font-medium text-sm">{notification.message}</span>
                   <button onClick={() => setNotification(null)} className="ml-2 hover:bg-white/10 p-1 rounded-full transition-colors">
                       <X className="w-4 h-4" />
                   </button>
               </div>
           )}

           {/* Confirmation Modal */}
           <AlertDialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
                <AlertDialogContent className="bg-[#0f1715] border border-white/10 text-white">
                  <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-red-950/50 border border-red-500/20 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <AlertDialogTitle className="text-xl">Delete Review?</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-slate-400 text-base">
                      Are you sure you want to delete your review? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-3 mt-4">
                    <AlertDialogCancel 
                        className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white mt-0 border-0"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={() => reviewToDelete && executeDeleteReview(reviewToDelete)}
                        className="bg-red-600 hover:bg-red-500 text-white border-0 shadow-lg shadow-red-900/20"
                    >
                        Delete Review
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
           </AlertDialog>
      </div>
    </div>
  );
};


export default SriLankaMap;
