import { useState, useRef, useCallback, useMemo } from 'react';
import svgPaths from '../../imports/svg-zf6pg056p3';
import svgMain from '../../imports/svg-q05k7ytov1';
import { imgHelp } from '../../imports/svg-ss3mz';
import { FacebookIcon, InstagramIcon, LinkedInIcon } from './PlatformIcons';
import {
  Grid3X3, List, Trash2, Upload,
  Camera, Smile, Type, Lightbulb, X, Plus, ChevronDown
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Platform = 'facebook' | 'instagram' | 'linkedin';
type TabKey = 'initial' | Platform;
type MediaView = 'grid' | 'table';

interface MediaItem {
  id: string;
  file?: File;
  url: string;
  name: string;
  size: string;
  dateAdded: string;
}

const MAX_MEDIA = 50;
const GRID_PAGE_SIZE = 13; // how many thumbnails to show per "page"

// Picsum seeds chosen to give a nice variety of food/lifestyle/real-estate shots
const PICSUM_SEEDS = [
  'burger','pizza','coffee','sushi','tacos','pasta','salad','steak',
  'bakery','brunch','smoothie','noodles','dessert','barbecue','seafood','breakfast',
  'realestate','house','apartment','office','interior','exterior','garden','pool',
  'cityscape','street','nature','forest','beach','mountain','sunset','sunrise',
  'portrait','team','event','conference','workshop','meeting','training','celebration',
  'product','brand','logo','social','marketing','digital','creative','design',
  'travel','holiday',
];

// Pre-computed sizes to keep DEMO_MEDIA stable across renders
const DEMO_SIZES = [248, 312, 187, 425, 198, 276, 341, 159, 302, 218,
  388, 145, 267, 412, 193, 334, 278, 156, 421, 239,
  184, 317, 263, 401, 172, 295, 338, 207, 365, 143,
  289, 376, 231, 157, 413, 284, 196, 352, 168, 309,
  244, 387, 162, 421, 276, 198, 335, 253, 178, 411];

const DEMO_MEDIA: MediaItem[] = PICSUM_SEEDS.map((seed, i) => ({
  id: `media-${i + 1}`,
  url: `https://picsum.photos/seed/${seed}/400/400`,
  name: `${seed}-photo.jpg`,
  size: `${DEMO_SIZES[i]} KB`,
  dateAdded: 'Apr 8, 2026',
}));


// ─── Chevron Down Icon ────────────────────────────────────────────────────────
function ChevronDownIcon({ color = '#303030' }: { color?: string }) {
  return (
    <div className="relative shrink-0 size-[20px]">
      <div
        className="absolute inset-[37.46%_27.42%_37.45%_27.49%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-5.498px_-7.492px] mask-size-[20px_20px]"
        style={{ maskImage: `url('${imgHelp}')` }}
      >
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.01782 5.0176">
          <path d={svgPaths.p5ccaa80} fill={color} />
        </svg>
      </div>
    </div>
  );
}

// ─── Chevron Up Icon ─────────────────────────────────────────────────────────
function ChevronUpIcon() {
  return (
    <div className="relative shrink-0 size-[20px]">
      <div
        className="absolute inset-[37.53%_27.44%_37.4%_27.42%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-5.484px_-7.506px] mask-size-[20px_20px]"
        style={{ maskImage: `url('${imgHelp}')` }}
      >
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.02811 5.01367">
          <path d={svgPaths.pddafd00} fill="#303030" />
        </svg>
      </div>
    </div>
  );
}

// ─── Info Icon ────────────────────────────────────────────────────────────────
function InfoIcon({ color = '#888888' }: { color?: string }) {
  return (
    <div className="relative shrink-0 size-[16px]">
      <div
        className="absolute inset-[12.08%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.933px_-1.933px] mask-size-[16px_16px]"
        style={{ maskImage: `url('${imgHelp}')` }}
      >
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.1666 15.1666">
          <path d={svgMain.p32bf4c0} fill={color} />
        </svg>
      </div>
    </div>
  );
}

// ─── Platform Chip ────────────────────────────────────────────────────────────
function PlatformChip({ platform, onRemove }: { platform: Platform; onRemove: () => void }) {
  const icon = platform === 'facebook' ? <FacebookIcon /> : platform === 'instagram' ? <InstagramIcon /> : <LinkedInIcon />;
  const label = platform === 'facebook' ? 'Facebook' : platform === 'instagram' ? 'Instagram' : 'LinkedIn';
  return (
    <div className="content-stretch flex gap-[6px] items-center bg-background relative shrink-0" style={{ border: '1px solid var(--s-border-subtle)', borderRadius: 4, padding: '4px 8px', height: 28 }}>
      <div className="shrink-0 size-[16px]">{icon}</div>
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-foreground text-[13px] tracking-[-0.26px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        {label}
      </p>
      <button
        onClick={onRemove}
        className="flex items-center justify-center text-muted-foreground hover:text-[#212121] dark:hover:text-[#e4e8f0] ml-[2px]"
      >
        <X size={11} strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Tag Chip ─────────────────────────────────────────────────────────────────
function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" style={{ border: '1px solid var(--s-border-subtle)', borderRadius: 4, padding: '2px 8px', height: 24, backgroundColor: 'var(--s-bg-primary)' }}>
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-foreground text-[13px] tracking-[-0.26px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        {label}
      </p>
      <button onClick={onRemove} className="flex items-center justify-center text-muted-foreground hover:text-[#212121] dark:hover:text-[#e4e8f0]">
        <X size={10} strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Custom Checkbox ──────────────────────────────────────────────────────────
function CustomCheckbox({ checked, onClick }: { checked: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center" type="button">
      {checked ? (
        <div className="w-[18px] h-[18px] rounded-[3px] flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.1)]" style={{ backgroundColor: '#1976d2' }}>
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <div className="w-[18px] h-[18px] rounded-[3px] border-[1.5px] border-[#a0a0a0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"></div>
      )}
    </button>
  );
}

// ─── Radio Button ───────────────────────────────────────────────────────────
function RadioButton({ selected }: { selected: boolean }) {
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{
        width: 16, height: 16,
        border: selected ? '1.5px solid #1976d2' : '1.5px solid #c4c4c4',
        backgroundColor: 'white',
        transition: 'all 0.1s'
      }}
    >
      {selected && <div className="rounded-full" style={{ width: 8, height: 8, backgroundColor: '#1976d2' }} />}
    </div>
  );
}

// ─── Native Date / Time Picker Wrapper ──────────────────────────────────────
const PickCalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
const PickClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

function NativePicker({ type, value, onChange, icon, width = 160, hasError = false, min }: { type: 'date'|'time', value: string, onChange: (v: string) => void, icon: React.ReactNode, width?: number, hasError?: boolean, min?: string }) {
  return (
    <div
      className="relative flex items-center gap-[8px] focus-within:border-[#1976d2] dark:focus-within:border-[#5b9cf6] transition-colors"
      style={{
        border: `1px solid ${hasError ? '#de1b0c' : 'var(--s-border-subtle)'}`, borderRadius: 4,
        padding: '0 10px', height: 34, backgroundColor: 'var(--s-bg-input)', width
      }}
    >
      <div className="shrink-0 flex items-center justify-center text-muted-foreground pointer-events-none">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        min={min}
        onChange={e => onChange(e.target.value)}
        className="outline-none bg-transparent w-full h-full cursor-pointer relative z-10 full-picker"
        style={{
          fontSize: 13,color: value ? 'var(--s-text-primary)' : '#aaa',
        }}
      />
    </div>
  );
}

// ─── Media Grid Item ──────────────────────────────────────────────────────────
function MediaGridItem({
  item, selected, onToggleSelect, onDelete,
}: {
  item: MediaItem; selected: boolean; onToggleSelect: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative cursor-pointer group rounded-[6px] overflow-hidden"
      style={{ border: selected ? '2px solid #1976d2' : '2px solid transparent', flexShrink: 0, aspectRatio: '1/1', width: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggleSelect}
    >
      <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
      
      {/* Subtle scrim when hovered but not selected */}
      {hovered && !selected && (
        <div className="absolute inset-0 bg-black/10 transition-opacity pointer-events-none" />
      )}
      
      {/* Top right actions on hover */}
      {(hovered && !selected) && (
        <div className="absolute top-[6px] right-[6px] flex items-center gap-[4px] z-10 transition-opacity">
          {/* Edit icon */}
          <button 
            className="w-[26px] h-[26px] rounded-[4px] flex items-center justify-center hover:bg-white transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            onClick={(e) => { e.stopPropagation(); /* TODO Edit file */ }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Delete icon */}
          <button 
            className="w-[26px] h-[26px] rounded-[4px] flex items-center justify-center hover:bg-white transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 size={12} className="text-[#de1b0c]" />
          </button>
        </div>
      )}

      {/* Select state indicator (Checkmark overlay) */}
      {(hovered || selected) && (
        <div className="absolute top-[10px] left-[10px] pointer-events-none transition-opacity z-10">
          <CustomCheckbox checked={selected} />
        </div>
      )}
    </div>
  );
}

// ─── Upload Cell ──────────────────────────────────────────────────────────────
function UploadCell({ onFilesAdded, disabled }: { onFilesAdded: (f: File[]) => void; disabled: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) onFilesAdded(files);
  }, [disabled, onFilesAdded]);

  return (
    <div
      className="flex flex-col items-center justify-center cursor-pointer transition-colors"
      style={{
        aspectRatio: '1/1', width: '100%', borderRadius: 6, flexShrink: 0,
        border: dragging ? '1.5px solid #1976d2' : '1.5px dashed #c4c4c4',
        backgroundColor: dragging ? '#e8f0fe' : '#fafafa',
      }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" disabled={disabled}
        onChange={(e) => {
          const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
          if (files.length) onFilesAdded(files);
          e.target.value = '';
        }}
      />
      {/* Simple Plus icon */}
      <Plus size={24} className="text-[#555]" strokeWidth={1.5} />
    </div>
  );
}

// ─── Media Section ────────────────────────────────────────────────────────────
function MediaSection({ mediaItems, setMediaItems }: {
  mediaItems: MediaItem[];
  setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(true);
  const [mediaView, setMediaView] = useState<MediaView>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(GRID_PAGE_SIZE);

  // Reset pagination when media view changes
  const handleViewChange = (view: MediaView) => {
    setMediaView(view);
    setVisibleCount(GRID_PAGE_SIZE);
  };

  const allSelected = mediaItems.length > 0 && selectedIds.size === mediaItems.length;
  const visibleItems = useMemo(() => mediaItems.slice(0, visibleCount), [mediaItems, visibleCount]);
  const hasMore = visibleCount < mediaItems.length;

  const toggleSelectAll = () => {
    if (!allSelected) {
      setSelectedIds(new Set(mediaItems.map(m => m.id)));
      setVisibleCount(mediaItems.length);
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDelete = (id: string) => {
    setMediaItems(prev => prev.filter(m => m.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleBulkDelete = () => {
    setMediaItems(prev => prev.filter(m => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
  };

  const handleFilesAdded = (files: File[]) => {
    const newItems: MediaItem[] = files.map(file => ({
      id: `media-${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));
    setMediaItems(prev => [...prev, ...newItems]);
  };

  const count = mediaItems.length;
  const label = count === 0 ? 'No attached images' : count === 1 ? '1 attached image' : `${count} attached images`;

  return (
    <div className="border border-border rounded-[8px] overflow-hidden bg-background transition-colors duration-300">
      {/* Section header */}
      <div
        className="w-full flex items-center justify-between bg-muted  px-[16px] py-[12px]"
      >
        <div className="flex items-center gap-[8px]">
          <Camera size={18} className="text-muted-foreground" />
          <p className="font-['Roboto:Medium',sans-serif] font-normal leading-[20px] text-foreground text-[16px] tracking-[-0.32px]" style={{ fontVariationSettings: "'wdth' 100", cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
            {label}
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            multiple 
            className="hidden" 
            onChange={e => {
              const f = Array.from(e.target.files || []).filter(file => file.type.startsWith('image/'));
              if (f.length) handleFilesAdded(f);
              e.target.value = '';
            }} 
          />
        </div>
        <div className="flex items-center gap-[8px]">
          {/* Add Media Text Button */}
          {expanded && (
            <label className="cursor-pointer font-medium hover:underline mr-[8px]" style={{ color: 'var(--s-blue)', fontSize: 14,}}>
              Add media
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                const f = Array.from(e.target.files || []).filter(file => file.type.startsWith('image/'));
                if (f.length) handleFilesAdded(f);
                e.target.value = '';
              }} />
            </label>
          )}

          {/* Grid/Table toggle - only when expanded and has items */}
          {expanded && count > 0 && (
            <div
              className="flex items-center gap-[2px] rounded-[4px] p-[2px]"
              style={{ backgroundColor: 'var(--s-bg-muted)' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => handleViewChange('grid')}
                className="p-[4px] rounded-[3px] transition-colors flex items-center justify-center"
                style={{ backgroundColor: mediaView === 'grid' ? 'var(--s-bg-primary)' : 'transparent', color: mediaView === 'grid' ? 'var(--s-blue)' : 'var(--s-text-muted)' }}
                title="Grid view"
              >
                <Grid3X3 size={12} />
              </button>
              <button
                onClick={() => handleViewChange('table')}
                className="p-[4px] rounded-[3px] transition-colors flex items-center justify-center"
                style={{ backgroundColor: mediaView === 'table' ? 'var(--s-bg-primary)' : 'transparent', color: mediaView === 'table' ? 'var(--s-blue)' : 'var(--s-text-muted)' }}
                title="List view"
              >
                <List size={12} />
              </button>
            </div>
          )}
          {expanded ? <button onClick={() => setExpanded(false)}><ChevronUpIcon /></button> : <button onClick={() => setExpanded(true)}><ChevronDownIcon /></button>}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-[16px] py-[16px]" style={{ maxHeight: 500, overflowY: 'auto' }}>
          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between px-[16px] py-[10px] mb-[12px] rounded-[4px]" style={{ backgroundColor: 'var(--s-bg-primary)', border: '1px solid var(--s-blue)', position: 'relative' }}>
              {/* Optional tiny triangle for speech bubble effect */}
              <div style={{ position: 'absolute', bottom: '-5px', left: '20px', width: '9px', height: '9px', backgroundColor: 'var(--s-bg-primary)', borderRight: '1px solid var(--s-blue)', borderBottom: '1px solid var(--s-blue)', transform: 'rotate(45deg)' }} />

              <div className="flex items-center gap-[12px]">
                <CustomCheckbox checked={allSelected} onClick={toggleSelectAll} />
                <span style={{ fontSize: 14, color: 'var(--s-text-primary)',fontWeight: 600 }}>{selectedIds.size} selected</span>
              </div>
              <div className="flex items-center gap-[16px]">
                <button onClick={() => setSelectedIds(new Set())} style={{ color: 'var(--s-blue)', fontSize: 14,fontWeight: 500 }}>
                  Cancel
                </button>
                <button onClick={handleBulkDelete} className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[4px] hover:bg-muted transition-colors shadow-sm" style={{ border: '1px solid var(--s-border)', backgroundColor: 'var(--s-bg-primary)', color: 'var(--s-text-primary)', fontSize: 13,fontWeight: 500 }}>
                  <Trash2 size={13} className="text-muted-foreground" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Grid View */}
          {mediaView === 'grid' && (
            <div>
              {/* Responsive auto-fill grid that stretches to fill empty space */}
              <div 
                className="grid gap-[12px]"
                style={{ 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' 
                }}
              >
                {/* Upload cell as the first block */}
                <UploadCell onFilesAdded={handleFilesAdded} disabled={false} />
                {visibleItems.map(item => (
                  <MediaGridItem
                    key={item.id}
                    item={item}
                    selected={selectedIds.has(item.id)}
                    onToggleSelect={() => toggleSelect(item.id)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
                {count === 0 && (
                  <div className="flex flex-col items-center justify-center py-[24px] w-full gap-[10px]">
                    <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0f0f0' }}>
                      <Upload size={18} className="text-[#aaa]" />
                    </div>
                    <p style={{ fontSize: 13, color: '#888',}}>Drag & drop or click to add up to {MAX_MEDIA} images</p>
                    <label className="flex items-center gap-[5px] text-white text-[13px] font-medium px-[12px] py-[6px] rounded-[4px] cursor-pointer transition-colors" style={{ backgroundColor: '#1976d2',}}>
                      <Upload size={12} />
                      Upload images
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => { const f = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/')); if (f.length) handleFilesAdded(f); e.target.value = ''; }} />
                    </label>
                  </div>
                )}
              </div>
              {/* Pagination — Load more */}
              {hasMore && (
                <div className="flex items-center justify-start mt-[16px]">
                  <button
                    onClick={() => setVisibleCount(count)}
                    className="flex items-center gap-[6px] hover:bg-muted transition-colors px-[8px] py-[6px] -ml-[8px] rounded-[4px]"
                    style={{ color: 'var(--s-blue)', fontSize: 14,fontWeight: 500 }}
                  >
                    Show all media
                    <ChevronDown size={14} strokeWidth={2} />
                  </button>
                </div>
              )}
              {/* Show less — when all visible and count > page size */}
              {!hasMore && count > GRID_PAGE_SIZE && (
                <div className="flex justify-start mt-[16px]">
                  <button
                    onClick={() => setVisibleCount(GRID_PAGE_SIZE)}
                    className="flex items-center gap-[6px] hover:bg-muted transition-colors px-[8px] py-[6px] -ml-[8px] rounded-[4px]"
                    style={{ color: 'var(--s-blue)', fontSize: 14,fontWeight: 500 }}
                  >
                    Show less media
                    <ChevronDown size={14} strokeWidth={2} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Table View */}
          {mediaView === 'table' && (
            <div style={{ border: '1px solid var(--s-border)', borderRadius: 4, overflow: 'hidden' }}>
              {count === 0 ? (
                <div className="flex flex-col items-center justify-center py-[24px] gap-[8px]">
                  <Upload size={18} className="text-[#aaa]" />
                  <p style={{ fontSize: 13, color: '#888',}}>No images added</p>
                  <label className="flex items-center gap-[5px] text-white text-[13px] px-[12px] py-[6px] rounded-[4px] cursor-pointer" style={{ backgroundColor: '#1976d2',}}>
                    <Upload size={12} />
                    Upload images
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => { const f = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/')); if (f.length) handleFilesAdded(f); e.target.value = ''; }} />
                  </label>
                </div>
              ) : (
                <>
                  <table className="w-full text-left">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--s-bg-secondary)', borderBottom: '1px solid var(--s-border)' }}>
                        <th style={{ width: 36, padding: '7px 12px' }}>
                          <CustomCheckbox checked={allSelected} onClick={toggleSelectAll} />
                        </th>
                        <th style={{ width: 48, padding: '7px 8px', fontSize: 11, color: 'var(--s-text-muted)',fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview</th>
                        <th style={{ padding: '7px 8px', fontSize: 11, color: 'var(--s-text-muted)',fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                        <th style={{ width: 80, padding: '7px 8px', fontSize: 11, color: 'var(--s-text-muted)',fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Size</th>
                        <th style={{ width: 110, padding: '7px 8px', fontSize: 11, color: 'var(--s-text-muted)',fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date added</th>
                        {selectedIds.size === 0 && <th style={{ width: 50, padding: '7px 8px' }}></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleItems.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--s-border)', backgroundColor: selectedIds.has(item.id) ? 'var(--s-blue-bg)' : 'var(--s-bg-primary)' }}>
                          <td style={{ padding: '8px 12px' }}>
                            <CustomCheckbox checked={selectedIds.has(item.id)} onClick={() => toggleSelect(item.id)} />
                          </td>
                          <td style={{ padding: '8px' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 4, overflow: 'hidden', backgroundColor: 'var(--s-bg-muted)' }}>
                              <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            </div>
                          </td>
                          <td style={{ padding: '8px', fontSize: 13, color: 'var(--s-text-primary)',maxWidth: 180 }}>
                            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                          </td>
                          <td style={{ padding: '8px', fontSize: 12, color: 'var(--s-text-muted)',}}>{item.size}</td>
                          <td style={{ padding: '8px', fontSize: 12, color: 'var(--s-text-muted)',}}>{item.dateAdded}</td>
                          {selectedIds.size === 0 && (
                            <td style={{ padding: '8px' }}>
                              <button onClick={() => handleDelete(item.id)} className="text-[#aaa] hover:text-[#de1b0c] transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Table footer: load more + add images */}
                  <div style={{ padding: '8px 12px', borderTop: '1px solid var(--s-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {hasMore ? (
                      <button
                        onClick={() => setVisibleCount(count)}
                        className="flex items-center gap-[5px]"
                        style={{ color: 'var(--s-blue)', fontSize: 13,fontWeight: 500 }}
                      >
                        <ChevronDown size={13} strokeWidth={2} />
                        Show all media ({count - visibleCount} remaining)
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#aaa',}}>{count} of {count} images</span>
                    )}
                    <label className="flex items-center gap-[5px] cursor-pointer font-medium" style={{ color: 'var(--s-blue)', fontSize: 13,}}>
                      <Plus size={13} />
                      Add more
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => { const f = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/')); if (f.length) handleFilesAdded(f); e.target.value = ''; }} />
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────
function PreviewPanel({ content, mediaItems }: { content: string; mediaItems: MediaItem[] }) {
  const [platformExpanded, setPlatformExpanded] = useState(true);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-[20px] pt-[20px] pb-[12px]">
        <div className="flex items-center gap-[6px] mb-[8px]">
          <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] text-foreground text-[16px] tracking-[-0.32px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Preview
          </p>
        </div>
        <div className="flex items-start gap-[6px]">
          <div className="shrink-0 mt-[2px]">
            <InfoIcon />
          </div>
          <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[18px] text-muted-foreground text-[12px] tracking-[-0.24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Preview approximates how your content will display when published. Tests and updates by social networks may affect the final appearance.
          </p>
        </div>
      </div>

      {/* Facebook accordion */}
      <div className="flex-1 overflow-y-auto px-[20px] pb-[20px]">
        <div style={{ border: '1px solid var(--s-border)', borderRadius: 6, overflow: 'hidden' }}>
          {/* Platform row */}
          <div
            className="flex items-center justify-between px-[16px] py-[12px] cursor-pointer"
            style={{ backgroundColor: 'var(--s-bg-secondary)' }}
            onClick={() => setPlatformExpanded(v => !v)}
          >
            <div className="flex items-center gap-[8px]">
              <div className="shrink-0 size-[20px]">
                <FacebookIcon />
              </div>
              <div className="flex items-center gap-[6px]">
                <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] text-foreground text-[14px] tracking-[-0.28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Facebook
                </p>
                <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] text-muted-foreground text-[13px] tracking-[-0.26px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  3 Pages
                </p>
              </div>
            </div>
            {platformExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </div>

          {/* Post preview card */}
          {platformExpanded && (
            <div className="px-[16px] py-[14px]" style={{ borderTop: '1px solid var(--s-border)' }}>
              {/* Avatar + user row */}
              <div className="flex items-center gap-[10px] mb-[10px]">
                <div className="shrink-0 w-[36px] h-[36px] rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--s-text-primary)' }}>
                  <p className="font-['Roboto:Regular',sans-serif] font-normal text-white text-[14px] leading-[normal]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    M
                  </p>
                </div>
                <div>
                  <p className="font-['Roboto:Regular',sans-serif] font-normal text-foreground text-[14px] leading-[20px] tracking-[-0.28px]" style={{ fontVariationSettings: "'wdth' 100", fontWeight: 600 }}>
                    Motto mortgage - Holidays
                  </p>
                  <p className="font-['Roboto:Regular',sans-serif] font-normal text-muted-foreground text-[12px] leading-[normal]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Just now · 🌐
                  </p>
                </div>
              </div>

              {/* Post body */}
              <p className="font-['Roboto:Regular',sans-serif] font-normal text-foreground text-[13px] leading-[20px] tracking-[-0.26px] mb-[6px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {content
                  ? content.length > 280 ? content.substring(0, 280) + '...' : content
                  : 'So, how can a homebuyer show the current homeowner they are serious about buying? Meet Ernest. Well, earnest money actually. 😄'}
              </p>
              <p className="font-['Roboto:Regular',sans-serif] font-normal text-muted-foreground text-[13px] leading-[20px] mb-[6px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Earnest money is a deposit given to the seller when a buyer submits an offer on a home. It demonstrates their commitment to the purchase and is typically credited toward down payment or closing costs.
              </p>
              <p className="font-['Roboto:Regular',sans-serif] font-normal text-muted-foreground text-[13px] leading-[20px] mb-[10px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Questions about earnest money? Reach out for details.
              </p>
              <p className="font-['Roboto:Regular',sans-serif] font-normal text-[#1976d2]  text-[13px] leading-[18px] mb-[10px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                #EarnestMoney #SeriousBuyer #HomeBuyingTips #RealEstateAdvice #HomeownershipJourney #CommitmentToBuy #DownPayment #ClosingCosts #HomeGoals #TrustedAdvisor #StartYourJourney #HomeBuyingJourney
              </p>
              {/* Post image */}
              <div style={{ borderRadius: 4, overflow: 'hidden' }}>
                <img
                  src={mediaItems.length > 0 ? mediaItems[0].url : `https://picsum.photos/seed/burger/600/400`}
                  alt="Post preview"
                  className="w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface CreatePostViewProps {
  onBack: () => void;
  onPublish?: (mode: 'publish' | 'schedule' | 'draft', expiryDate?: string) => void;
}

export function CreatePostView({ onBack, onPublish }: CreatePostViewProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['facebook', 'instagram', 'linkedin']);
  const [activeTab, setActiveTab] = useState<TabKey>('initial');
  const [postContent, setPostContent] = useState(
    'Nothing beats a freshly grilled burger stacked with juicy patties, soft buns, and bold flavors in every bite. At our shop, we keep it simple—real ingredients, perfect grills, and burgers made to satisfy serious cravings. From the first bite to the last crumb, it\'s comfort, indulgence, and happiness all wrapped in one burger. Come hungry, eat happy, and leave planning your next visit. 😍🔥'
  );
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(DEMO_MEDIA);
  const [tags, setTags] = useState([
    { id: 't1', label: 'Photography' },
    { id: 't2', label: 'USA day' },
    { id: 't3', label: 'Warriors day' },
    { id: 't4', label: 'Independence day' },
  ]);
  const [selectedApproval, setSelectedApproval] = useState('');
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [checklistExpanded, setChecklistExpanded] = useState(true);
  const [addToLibrary, setAddToLibrary] = useState(true);
  const [draftCalendarEnabled, setDraftCalendarEnabled] = useState(false);
  const [timingModalOpen, setTimingModalOpen] = useState(false);
  
  // Per-channel schedule state
  const [channelSchedules, setChannelSchedules] = useState<Record<Platform, { date: string; time: string }>>({
    facebook: { date: '', time: '10:00' },
    instagram: { date: '', time: '10:00' },
    linkedin: { date: '', time: '10:00' },
  });

  // ── Post Timing ──
  type PublishMode = 'now' | 'scheduled' | 'draft';
  type ScheduleMode = 'global' | 'per-channel';
  const [publishMode, setPublishMode]   = useState<PublishMode>('scheduled');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('global');
  const [scheduleDate, setScheduleDate] = useState('2026-04-20');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryDate, setExpiryDate]       = useState('');
  const [expiryTime, setExpiryTime]       = useState('10:00');

  // Derived publish ISOs
  const allPublishISOs = publishMode === 'now'
    ? [new Date().toISOString().slice(0, 16)]
    : scheduleMode === 'global'
      ? (scheduleDate ? [`${scheduleDate}T${scheduleTime}`] : [])
      : selectedPlatforms.map(p => {
          const cs = channelSchedules[p];
          return cs && cs.date ? `${cs.date}T${cs.time}` : '';
        }).filter(Boolean);

  const latestPublishISO = allPublishISOs.length ? allPublishISOs.reduce((max, iso) => iso > max ? iso : max, "") : "";
  const earliestPublishISO = allPublishISOs.length ? allPublishISOs.reduce((min, iso) => iso < min ? iso : min, allPublishISOs[0]) : "";

  // For the timeline visualization
  const timelinePublishISO = earliestPublishISO;

  const expiryISO = expiryEnabled && expiryDate ? `${expiryDate}T${expiryTime}` : '';

  // Validation: Expiry must be after ALL publish dates. 
  const expiryBeforePublish  = !!(expiryISO && latestPublishISO && expiryISO <= latestPublishISO);
  const expiryEqualsPublish  = !!(expiryISO && latestPublishISO && expiryISO === latestPublishISO);
  const expiryInPast = publishMode === 'now' && !!(expiryISO && expiryISO < new Date().toISOString().slice(0, 16));
  const timingValid = !expiryBeforePublish && !expiryInPast;

  // Smart default: when enabling expiry, auto-fill latestPublishISO + 24h
  const handleToggleExpiry = (enabled: boolean) => {
    setExpiryEnabled(enabled);
    if (enabled && latestPublishISO) {
      const base = new Date(latestPublishISO);
      base.setHours(base.getHours() + 24);
      const d = base.toISOString().slice(0, 10);
      const t = base.toISOString().slice(11, 16);
      setExpiryDate(d);
      setExpiryTime(t);
    }
  };

  // Format display helpers
  const fmtDateTime = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Handle schedule mode switch
  const handleScheduleMode = (mode: ScheduleMode) => {
    if (mode === 'per-channel') {
      const newSchedules = { ...channelSchedules };
      for (const p of selectedPlatforms) {
        newSchedules[p] = { date: scheduleDate, time: scheduleTime };
      }
      setChannelSchedules(newSchedules);
    }
    setScheduleMode(mode);
  };

  const updateChannelSchedule = (platform: Platform, field: 'date' | 'time', value: string) => {
    setChannelSchedules(prev => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value }
    }));
  };

  // Handle publish mode switch
  const handlePublishMode = (mode: PublishMode) => {
    setPublishMode(mode);
    setDraftCalendarEnabled(false);
    if (mode === 'draft') {
      setExpiryEnabled(false);
    } else if (expiryEnabled) {
      handleToggleExpiry(true);
    }
  };

  const maxChars = 2200;
  const charsLeft = maxChars - postContent.length;

  const removePlatform = (p: Platform) => {
    setSelectedPlatforms(prev => prev.filter(x => x !== p));
    if (activeTab === p) setActiveTab('initial');
  };

  const APPROVAL_OPTIONS = ['Standard Review', 'Manager Approval', 'Legal Review', 'Executive Sign-off'];

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'initial', label: 'Initial content' },
    ...selectedPlatforms.map(p => ({
      key: p,
      label: p === 'facebook' ? 'Facebook' : p === 'instagram' ? 'Instagram' : 'LinkedIn',
    })),
  ];

  const schedulePickers = (
    <div className="flex flex-col gap-[12px]">
      {/* Segmented switcher — pill style */}
      <div className="inline-flex p-[3px]" style={{ backgroundColor: 'var(--s-border)', borderRadius: 8, alignSelf: 'flex-start' }}>
        <button
          onClick={() => handleScheduleMode('global')}
          className="transition-all"
          style={{
            padding: '4px 12px', fontSize: 12,fontVariationSettings: "'wdth' 100",
            backgroundColor: scheduleMode === 'global' ? 'var(--s-bg-primary)' : 'transparent',
            color: scheduleMode === 'global' ? 'var(--s-text-primary)' : 'var(--s-text-muted)',
            border: 'none', borderRadius: 6, cursor: 'pointer',
            fontWeight: scheduleMode === 'global' ? 500 : 400,
            boxShadow: scheduleMode === 'global' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          Same time for all
        </button>
        <button
          onClick={() => handleScheduleMode('per-channel')}
          className="transition-all"
          style={{
            padding: '4px 12px', fontSize: 12,fontVariationSettings: "'wdth' 100",
            backgroundColor: scheduleMode === 'per-channel' ? 'var(--s-bg-primary)' : 'transparent',
            color: scheduleMode === 'per-channel' ? 'var(--s-text-primary)' : 'var(--s-text-muted)',
            border: 'none', borderRadius: 6, cursor: 'pointer',
            fontWeight: scheduleMode === 'per-channel' ? 500 : 400,
            boxShadow: scheduleMode === 'per-channel' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          Different per channel
        </button>
      </div>

      {/* Same time for all — date + time pickers */}
      {scheduleMode === 'global' && (
        <div className="flex items-center gap-[10px]">
          <NativePicker type="date" value={scheduleDate} onChange={setScheduleDate} icon={<PickCalendarIcon />} width={160} />
          <NativePicker type="time" value={scheduleTime} onChange={setScheduleTime} icon={<PickClockIcon />} width={120} />
          <p className="font-['Roboto:Regular',sans-serif] text-[11px] text-[#aaa] shrink-0" style={{ fontVariationSettings: "'wdth' 100" }}>Your local time</p>
        </div>
      )}

      {/* Different per channel — one row per platform */}
      {scheduleMode === 'per-channel' && (
        <div className="flex flex-col gap-[8px]">
          {selectedPlatforms.map(platform => {
            const cs = channelSchedules[platform] || { date: '', time: '10:00' };
            const label = platform === 'facebook' ? 'Facebook' : platform === 'instagram' ? 'Instagram' : 'LinkedIn';
            return (
              <div key={platform} className="flex items-center gap-[10px]">
                <div className="shrink-0" style={{ width: 18, height: 18 }}>
                  {platform === 'facebook' ? <FacebookIcon /> : platform === 'instagram' ? <InstagramIcon /> : <LinkedInIcon />}
                </div>
                <span className="font-['Roboto:Regular',sans-serif] text-[12px] text-muted-foreground shrink-0" style={{ fontVariationSettings: "'wdth' 100", minWidth: 64 }}>{label}</span>
                <NativePicker type="date" value={cs.date} onChange={v => updateChannelSchedule(platform, 'date', v)} icon={<PickCalendarIcon />} width={150} />
                <NativePicker type="time" value={cs.time} onChange={v => updateChannelSchedule(platform, 'time', v)} icon={<PickClockIcon />} width={110} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col relative transition-colors duration-300" style={{ height: '100%', overflow: 'hidden' }}>
      <style>{`
        .full-picker::-webkit-calendar-picker-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ backgroundColor: 'var(--s-bg-primary)', borderBottom: '1px solid var(--s-border)', padding: '16px 20px' }}
      >
        {/* Left: back arrow + title */}
        <div className="flex items-center gap-[10px]">
          <button
            onClick={onBack}
            className="flex items-center justify-center rounded-[6px] hover:bg-muted transition-colors"
            style={{ width: 32, height: 32 }}
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--s-icon-fill)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[26px] text-foreground text-[18px] tracking-[-0.36px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Create post
          </p>
        </div>

        {/* Right: add to library + schedule */}
        <div className="flex items-center gap-[14px]">
          {/* Add to post library checkbox */}
          <label className="flex items-center gap-[7px] cursor-pointer">
            <div
              className="flex items-center justify-center rounded-[3px] shrink-0"
              style={{
                width: 16, height: 16,
                backgroundColor: addToLibrary ? 'var(--s-blue)' : 'var(--s-bg-primary)',
                border: addToLibrary ? '1px solid var(--s-blue)' : '1px solid #c4c4c4',
              }}
              onClick={() => setAddToLibrary(v => !v)}
            >
              {addToLibrary && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] text-foreground text-[14px] tracking-[-0.28px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Add to post library
            </p>
            <div className="flex items-center">
              <InfoIcon />
            </div>
          </label>

          {/* Schedule post — opens timing modal */}
          <button
            className="flex items-center justify-center hover:bg-primary/90 transition-colors"
            style={{ backgroundColor: '#1976d2', color: 'white', height: 36, padding: '0 20px', borderRadius: '4px',fontSize: 14, fontWeight: 500, letterSpacing: '-0.28px' }}
            onClick={() => setTimingModalOpen(true)}
          >
            Schedule post
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1" style={{ overflow: 'hidden' }}>

        {/* ── Left Form Panel ── */}
        <div className="overflow-y-auto bg-background" style={{ flex: '0 0 62%', borderRight: '1px solid var(--s-border)', minWidth: 0 }}>
          <div style={{ padding: '20px 30px' }} className="flex flex-col gap-[16px]">

            {/* ── Post Content Card ── */}
            <div className="border border-border rounded-[8px] overflow-hidden bg-background">
              <div className="w-full flex items-center justify-between bg-muted  px-[16px] py-[12px]">
                <p className="font-['Roboto:Regular',sans-serif] font-normal text-foreground text-[16px] tracking-[-0.32px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Post content
                </p>
              </div>
              <div className="px-[16px] py-[16px]">
                {/* Platform selector */}
                <div
                  className="flex items-center gap-[8px] flex-wrap mb-[12px]"
                  style={{ border: '1px solid var(--s-border)', borderRadius: 4, padding: '6px 12px', minHeight: 40 }}
                >
                  {selectedPlatforms.map(p => (
                    <PlatformChip key={p} platform={p} onRemove={() => removePlatform(p)} />
                  ))}
                  <div className="ml-auto">
                    <ChevronDownIcon />
                  </div>
                </div>

                {/* Content area (tabs + textarea) */}
                <div style={{ border: '1px solid var(--s-border)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                  {/* Tab row */}
                  <div className="flex" style={{ borderBottom: 'none' }}>
                    {tabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="transition-colors"
                        style={{
                          padding: '9px 14px',
                          fontSize: 13,letterSpacing: '-0.26px',
                          borderBottom: activeTab === tab.key ? '2px solid var(--s-blue)' : '2px solid transparent',
                          color: activeTab === tab.key ? 'var(--s-blue)' : 'var(--s-text-secondary)',
                          fontWeight: activeTab === tab.key ? 500 : 400,
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Textarea */}
                  <textarea
                    className="w-full outline-none resize-none bg-transparent"
                    style={{
                      padding: '14px 16px',
                      fontSize: 14,color: 'var(--s-text-primary)',
                      lineHeight: '22px',
                      letterSpacing: '-0.28px',
                      minHeight: 130,
                      fontVariationSettings: "'wdth' 100",
                      border: 'none',
                      display: 'block',
                      width: '100%',
                    }}
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                    placeholder="Write your post content..."
                  />

                  {/* Bottom toolbar */}
                  <div
                    className="flex items-center justify-between"
                    style={{ padding: '8px 14px', borderTop: 'none' }}
                  >
                    <div className="flex items-center gap-[10px]">
                      {/* Camera icon */}
                      <button className="flex items-center justify-center" style={{ color: 'var(--s-text-muted)', width: 20, height: 20 }} title="Add image">
                        <Camera size={18} strokeWidth={1.5} />
                      </button>
                      {/* Emoji icon */}
                      <button className="flex items-center justify-center" style={{ color: 'var(--s-text-muted)', width: 20, height: 20 }} title="Add emoji">
                        <Smile size={18} strokeWidth={1.5} />
                      </button>
                      {/* GIF / text icon */}
                      <button className="flex items-center justify-center" style={{ color: 'var(--s-text-muted)', width: 20, height: 20 }} title="Text format">
                        <Type size={16} strokeWidth={1.5} />
                      </button>
                    </div>

                    {/* Personalize link */}
                    <div className="flex items-center gap-[4px] cursor-pointer">
                      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] text-[#1976d2] text-[13px] tracking-[-0.26px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Personalize
                      </p>
                      <ChevronDownIcon color="#1976d2" />
                    </div>
                  </div>
                </div>

                {/* Character count */}
                <p
                  className="font-['Roboto:Regular',sans-serif] font-normal leading-[normal] text-[13px] tracking-[-0.26px]"
                  style={{ fontVariationSettings: "'wdth' 100", color: charsLeft < 50 ? '#de1b0c' : 'var(--s-text-secondary)' }}
                >
                  {charsLeft} characters left
                </p>
              </div>
            </div>

            {/* ── Media Section ── */}
            <MediaSection mediaItems={mediaItems} setMediaItems={setMediaItems} />

            {/* ── Tags Section ── */}
            <div className="border border-border rounded-[8px] overflow-hidden bg-background">
              <div className="w-full flex items-center justify-between bg-muted  px-[16px] py-[12px]">
                <div className="flex items-center gap-[5px]">
                  <p className="font-['Roboto:Regular',sans-serif] font-normal text-foreground text-[16px] tracking-[-0.32px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Tags
                  </p>
                  <InfoIcon />
                </div>
                <button>
                  <p className="font-['Roboto:Regular',sans-serif] font-normal text-[#1976d2]  text-[13px] tracking-[-0.26px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Manage tags
                  </p>
                </button>
              </div>
              <div className="px-[16px] py-[16px]">
                <div className="flex flex-wrap gap-[6px] items-center">
                  {tags.map(tag => (
                    <TagChip key={tag.id} label={tag.label} onRemove={() => setTags(prev => prev.filter(t => t.id !== tag.id))} />
                  ))}
                  {tags.length > 0 && (
                    <button onClick={() => setTags([])} className="flex items-center justify-center" style={{ color: '#888', width: 20, height: 20 }}>
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Approvals Section ── */}
            <div className="border border-border rounded-[8px] overflow-hidden bg-background">
              <div className="w-full flex items-center justify-between bg-muted  px-[16px] py-[12px]">
                <div className="flex items-center gap-[5px]">
                  <p className="font-['Roboto:Regular',sans-serif] font-normal text-foreground text-[16px] tracking-[-0.32px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Approvals
                  </p>
                  <InfoIcon />
                </div>
              </div>
              <div className="px-[16px] py-[16px]">
                <div className="relative">
                  <button
                    className="w-full flex items-center justify-between transition-colors"
                    style={{ border: '1px solid var(--s-border)', borderRadius: 4, padding: '8px 12px', height: 36, backgroundColor: 'var(--s-bg-input)' }}
                    onClick={() => setApprovalOpen(v => !v)}
                  >
                    <p
                      className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] text-[14px] tracking-[-0.28px]"
                      style={{ fontVariationSettings: "'wdth' 100", color: selectedApproval ? 'var(--s-text-primary)' : '#aaaaaa' }}
                    >
                      {selectedApproval || 'Select approval'}
                    </p>
                    <div style={{ transform: approvalOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                      <ChevronDownIcon />
                    </div>
                  </button>
                  {approvalOpen && (
                    <div
                      className="absolute left-0 right-0 bg-background z-20"
                      style={{ top: '100%', marginTop: 2, border: '1px solid var(--s-border)', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      {APPROVAL_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          className="w-full text-left hover:bg-muted transition-colors"
                          style={{ padding: '9px 12px', fontSize: 14,color: 'var(--s-text-primary)', letterSpacing: '-0.28px' }}
                          onClick={() => { setSelectedApproval(opt); setApprovalOpen(false); }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Posting checklist ── */}
            <div className="border border-border rounded-[8px] overflow-hidden bg-background mb-[24px]">
              <div
                className="w-full flex items-center justify-between bg-muted  px-[16px] py-[12px] hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setChecklistExpanded(v => !v)}
              >
                <p className="font-['Roboto:Regular',sans-serif] font-normal text-foreground text-[16px] tracking-[-0.32px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Posting checklist
                </p>
                {checklistExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </div>

              {checklistExpanded && (
                <div className="px-[16px] py-[16px] flex flex-col gap-[10px]">
                  {/* Warning item 1 */}
                  <div className="flex items-start gap-[10px]">
                    <div className="shrink-0 mt-[1px]">
                      <Lightbulb size={15} style={{ color: '#f59e0b' }} />
                    </div>
                    <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] text-muted-foreground text-[13px] tracking-[-0.26px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Instagram's daily limit for sharing posts, reels, and stories combined is 50.
                    </p>
                  </div>
                  {/* Warning item 2 */}
                  <div className="flex items-start gap-[10px]">
                    <div className="shrink-0 mt-[1px]">
                      <Lightbulb size={15} style={{ color: '#f59e0b' }} />
                    </div>
                    <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] text-muted-foreground text-[13px] tracking-[-0.26px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      The{' '}
                      <span style={{ color: 'var(--s-blue)', cursor: 'pointer' }}>Facebook</span>
                      {' '}or{' '}
                      <span style={{ color: 'var(--s-blue)', cursor: 'pointer' }}>X (Twitter)</span>
                      {' '}accounts of at least one of your locations is disconnected or missing required permissions. Reconnect and try again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Preview Panel ── */}
        <div className="flex flex-col overflow-hidden" style={{ flex: '0 0 38%', backgroundColor: 'var(--s-bg-muted)', borderLeft: '1px solid var(--s-border)' }}>
          <PreviewPanel content={postContent} mediaItems={mediaItems} />
        </div>
      </div>

      {/* ── Post Timing Modal ── */}
      {timingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center"
          style={{ paddingTop: 80, backgroundColor: 'rgba(0,0,0,0.3)' }}
          onClick={() => setTimingModalOpen(false)}
        >
          <div
            className="bg-background flex flex-col"
            style={{ width: 580, maxHeight: '82vh', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-[20px] py-[14px] shrink-0" style={{ borderBottom: '1px solid var(--s-border)' }}>
              <p className="font-['Roboto:Regular',sans-serif] text-[16px] text-foreground tracking-[-0.32px]" style={{ fontVariationSettings: "'wdth' 100", fontWeight: 500 }}>
                Post timing
              </p>
              <button
                onClick={() => setTimingModalOpen(false)}
                className="flex items-center justify-center rounded-[4px] hover:bg-muted transition-colors"
                style={{ width: 28, height: 28 }}
              >
                <X size={16} color="var(--s-text-secondary)" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-[20px] py-[16px] flex flex-col gap-[0px]">

              {/* ── Publish mode radios ── */}
              <div className="flex flex-col gap-[10px]">

                <label className="flex items-start gap-[10px] cursor-pointer" onClick={() => handlePublishMode('now')}>
                  <div className="mt-[1px]"><RadioButton selected={publishMode === 'now'} /></div>
                  <div>
                    <p className="font-['Roboto:Regular',sans-serif] text-[13px] text-foreground leading-[18px]" style={{ fontVariationSettings: "'wdth' 100", fontWeight: publishMode === 'now' ? 500 : 400 }}>Publish now</p>
                    <p className="font-['Roboto:Regular',sans-serif] text-[12px] text-muted-foreground" style={{ fontVariationSettings: "'wdth' 100" }}>Goes live immediately</p>
                  </div>
                </label>

                <label className="flex items-start gap-[10px] cursor-pointer" onClick={() => handlePublishMode('scheduled')}>
                  <div className="mt-[1px]"><RadioButton selected={publishMode === 'scheduled'} /></div>
                  <div>
                    <p className="font-['Roboto:Regular',sans-serif] text-[13px] text-foreground leading-[18px]" style={{ fontVariationSettings: "'wdth' 100", fontWeight: publishMode === 'scheduled' ? 500 : 400 }}>Schedule for later</p>
                    <p className="font-['Roboto:Regular',sans-serif] text-[12px] text-muted-foreground" style={{ fontVariationSettings: "'wdth' 100" }}>Pick a date &amp; time</p>
                  </div>
                </label>

                {publishMode === 'scheduled' && (
                  <div className="pl-[26px]">{schedulePickers}</div>
                )}

                <label className="flex items-start gap-[10px] cursor-pointer" onClick={() => handlePublishMode('draft')}>
                  <div className="mt-[1px]"><RadioButton selected={publishMode === 'draft'} /></div>
                  <div>
                    <p className="font-['Roboto:Regular',sans-serif] text-[13px] text-foreground leading-[18px]" style={{ fontVariationSettings: "'wdth' 100", fontWeight: publishMode === 'draft' ? 500 : 400 }}>Save as draft</p>
                    <p className="font-['Roboto:Regular',sans-serif] text-[12px] text-muted-foreground" style={{ fontVariationSettings: "'wdth' 100" }}>Save now, publish or schedule later</p>
                  </div>
                </label>

                {publishMode === 'draft' && (
                  <div className="pl-[26px]">
                    <div className="flex flex-col gap-[10px] rounded-[8px] px-[12px] py-[10px]" style={{ backgroundColor: 'var(--s-bg-muted)' }}>
                      <div className="flex items-start justify-between gap-[12px]">
                        <div>
                          <p className="font-['Roboto:Regular',sans-serif] text-[13px] text-foreground" style={{ fontVariationSettings: "'wdth' 100", fontWeight: 500 }}>Add to calendar</p>
                          <p className="font-['Roboto:Regular',sans-serif] text-[12px] text-muted-foreground" style={{ fontVariationSettings: "'wdth' 100" }}>Show this draft on the calendar at a set time</p>
                        </div>
                        <button
                          onClick={() => setDraftCalendarEnabled(v => !v)}
                          className="relative shrink-0 transition-colors"
                          style={{ width: 36, height: 20, borderRadius: 10, backgroundColor: draftCalendarEnabled ? 'var(--s-blue)' : '#d0d0d0', border: 'none', cursor: 'pointer', marginTop: 2 }}
                        >
                          <span className="absolute top-[2px] transition-all duration-200" style={{ left: draftCalendarEnabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', display: 'block' }} />
                        </button>
                      </div>
                      {draftCalendarEnabled && (
                        <div className="flex items-center gap-[10px]">
                          <NativePicker type="date" value={scheduleDate} onChange={setScheduleDate} icon={<PickCalendarIcon />} width={160} />
                          <NativePicker type="time" value={scheduleTime} onChange={setScheduleTime} icon={<PickClockIcon />} width={120} />
                          <p className="font-['Roboto:Regular',sans-serif] text-[11px] text-[#aaa] shrink-0" style={{ fontVariationSettings: "'wdth' 100" }}>Draft won't publish automatically</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Divider ── */}
              <div className="border-t border-border" style={{ margin: '16px 0' }} />

              {/* ── Set Expiry ── */}
              <div
                className="flex flex-col gap-[12px]"
                style={publishMode === 'draft' ? { opacity: 0.45, pointerEvents: 'none' } : {}}
              >
                <div className="flex items-start justify-between gap-[16px]">
                  <div>
                    <p className="font-['Roboto:Regular',sans-serif] text-[13px] text-foreground" style={{ fontVariationSettings: "'wdth' 100", fontWeight: 500 }}>Set expiry</p>
                    <p className="font-['Roboto:Regular',sans-serif] text-[12px] text-muted-foreground" style={{ fontVariationSettings: "'wdth' 100" }}>Post will be removed after this time</p>
                  </div>
                  <button
                    onClick={() => handleToggleExpiry(!expiryEnabled)}
                    className="relative shrink-0 transition-colors"
                    style={{ width: 36, height: 20, borderRadius: 10, backgroundColor: expiryEnabled ? 'var(--s-blue)' : '#d0d0d0', border: 'none', cursor: 'pointer', marginTop: 2 }}
                  >
                    <span className="absolute top-[2px] transition-all duration-200" style={{ left: expiryEnabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', display: 'block' }} />
                  </button>
                </div>

                {expiryEnabled && (
                  <>
                    <div className="flex items-center gap-[10px]">
                      <NativePicker type="date" value={expiryDate} onChange={setExpiryDate} min={publishMode === 'scheduled' && scheduleDate ? scheduleDate : new Date().toISOString().slice(0, 10)} icon={<PickCalendarIcon />} width={160} hasError={expiryBeforePublish || expiryInPast} />
                      <NativePicker type="time" value={expiryTime} onChange={setExpiryTime} icon={<PickClockIcon />} width={120} hasError={expiryBeforePublish || expiryInPast} />
                    </div>
                    {expiryInPast && <p className="font-['Roboto:Regular',sans-serif] text-[12px] text-[#de1b0c]" style={{ fontVariationSettings: "'wdth' 100" }}>Expiry must be in the future</p>}
                    {!expiryInPast && expiryEqualsPublish && <p className="font-['Roboto:Regular',sans-serif] text-[12px] text-[#de1b0c]" style={{ fontVariationSettings: "'wdth' 100" }}>Expiry can't be the same as publish time</p>}
                    {!expiryInPast && !expiryEqualsPublish && expiryBeforePublish && <p className="font-['Roboto:Regular',sans-serif] text-[12px] text-[#de1b0c]" style={{ fontVariationSettings: "'wdth' 100" }}>Expiry must be after the publish time</p>}
                    <p className="font-['Roboto:Regular',sans-serif] text-[11px] text-[#aaa]" style={{ fontVariationSettings: "'wdth' 100" }}>Some platforms may not support automatic removal</p>

                    {timelinePublishISO && expiryISO && timingValid && (
                      <div className="flex flex-col gap-[8px]">
                        <p className="font-['Roboto:Regular',sans-serif] text-[11px] text-[#888]" style={{ fontVariationSettings: "'wdth' 100", textTransform: 'uppercase', letterSpacing: '0.06em' }}>Post lifecycle</p>
                        {/* Track row: dots + lines all on the same items-center axis */}
                        <div className="flex items-center">
                          <div className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: 'var(--s-blue)', boxShadow: '0 0 0 2px #c7ddf8' }} />
                          <div className="flex-1" style={{ height: 2, backgroundColor: 'var(--s-blue)', opacity: 0.5 }} />
                          <span className="font-['Roboto:Regular',sans-serif] text-[9px] px-[5px] py-[1px] rounded-full mx-[6px] shrink-0" style={{ backgroundColor: 'var(--s-blue-bg)', color: 'var(--s-blue)', fontVariationSettings: "'wdth' 100", fontWeight: 600, letterSpacing: '0.04em' }}>LIVE</span>
                          <div className="flex-1" style={{ height: 2, backgroundColor: '#c4c4c4' }} />
                          <div className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: '#c4c4c4', boxShadow: '0 0 0 2px #e0e0e0' }} />
                        </div>
                        {/* Labels row */}
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-['Roboto:Regular',sans-serif] text-[10px]" style={{ fontVariationSettings: "'wdth' 100", color: 'var(--s-blue)', fontWeight: 500, whiteSpace: 'nowrap' }}>{publishMode === 'now' ? 'Now' : fmtDateTime(timelinePublishISO)}</p>
                            <p className="font-['Roboto:Regular',sans-serif] text-[9px] text-[#aaa]" style={{ fontVariationSettings: "'wdth' 100", whiteSpace: 'nowrap' }}>Publish</p>
                          </div>
                          <div className="text-right">
                            <p className="font-['Roboto:Regular',sans-serif] text-[10px]" style={{ fontVariationSettings: "'wdth' 100", color: 'var(--s-text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>{fmtDateTime(expiryISO)}</p>
                            <p className="font-['Roboto:Regular',sans-serif] text-[9px] text-[#aaa]" style={{ fontVariationSettings: "'wdth' 100", whiteSpace: 'nowrap' }}>Expires</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-[8px] px-[20px] py-[14px] shrink-0" style={{ borderTop: '1px solid var(--s-border)' }}>
              <button
                onClick={() => setTimingModalOpen(false)}
                className="hover:bg-muted transition-colors"
                style={{ height: 36, padding: '0 16px', borderRadius: 4, border: '1px solid var(--s-border-subtle)',fontSize: 14, color: 'var(--s-text-primary)', fontWeight: 400 }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onPublish?.(publishMode === 'now' ? 'publish' : publishMode === 'scheduled' ? 'schedule' : 'draft', expiryISO || undefined); setTimingModalOpen(false); }}
                className="hover:opacity-90 transition-opacity"
                style={{ height: 36, padding: '0 20px', borderRadius: 4, backgroundColor: '#1976d2',fontSize: 14, color: 'white', fontWeight: 500 }}
              >
                {publishMode === 'now' ? 'Publish now' : publishMode === 'scheduled' ? 'Schedule post' : 'Save as draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
