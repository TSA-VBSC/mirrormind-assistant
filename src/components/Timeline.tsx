import { useState } from 'react';
import type { TimelineEntry } from '@/lib/types';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineProps {
  entries: TimelineEntry[];
  onSelectEntry?: (entry: TimelineEntry) => void;
}

export function Timeline({ entries, onSelectEntry }: TimelineProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const recentEntries = entries.slice(-60); // Last 60 entries (~30 seconds)
  const displayEntries = expanded ? recentEntries : recentEntries.slice(-30);

  const getStateColor = (state: string): string => {
    switch (state) {
      case 'clear':
        return 'bg-state-clear';
      case 'mixed':
        return 'bg-state-mixed';
      case 'low':
        return 'bg-state-low';
      default:
        return 'bg-muted';
    }
  };

  const getStrengthHeight = (strength: number): string => {
    const minHeight = 8;
    const maxHeight = 32;
    const height = minHeight + (strength / 100) * (maxHeight - minHeight);
    return `${height}px`;
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleSelect = (entry: TimelineEntry) => {
    setSelectedId(entry.id === selectedId ? null : entry.id);
    onSelectEntry?.(entry);
  };

  const selectedEntry = entries.find(e => e.id === selectedId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Expression Timeline</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label={expanded ? 'Show less' : 'Show more'}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              More
            </>
          )}
        </button>
      </div>

      {/* Timeline Strip */}
      <div 
        className="timeline-strip"
        role="listbox"
        aria-label="Expression timeline"
      >
        {displayEntries.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 px-3">
            Timeline will populate as expressions are detected...
          </p>
        ) : (
          displayEntries.map((entry) => (
            <button
              key={entry.id}
              className={`timeline-item ${getStateColor(entry.state)} ${
                entry.id === selectedId ? 'ring-2 ring-primary' : ''
              }`}
              style={{ height: getStrengthHeight(entry.topExpression.strength) }}
              onClick={() => handleSelect(entry)}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(entry)}
              role="option"
              aria-selected={entry.id === selectedId}
              aria-label={`${formatTime(entry.timestamp)}: ${entry.topExpression.name}, ${entry.topEmotion.name}`}
              title={`${entry.topExpression.name} - ${entry.topEmotion.name}`}
            />
          ))
        )}
      </div>

      {/* Selected Entry Details */}
      {selectedEntry && (
        <div className="p-3 rounded-lg bg-card border border-border animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              {formatTime(selectedEntry.timestamp)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              selectedEntry.state === 'clear' 
                ? 'bg-success/20 text-success' 
                : selectedEntry.state === 'mixed'
                ? 'bg-warning/20 text-warning'
                : 'bg-muted text-muted-foreground'
            }`}>
              {selectedEntry.state}
            </span>
          </div>
          <p className="font-medium">{selectedEntry.topExpression.name}</p>
          <p className="text-sm text-muted-foreground">
            → {selectedEntry.topEmotion.name} ({selectedEntry.topEmotion.confidence}%)
          </p>
        </div>
      )}
    </div>
  );
}