import React from 'react';
import { ProjectRevision } from '../../types';
import { Badge } from '../../components/common/Badge';

interface RevisionDiffProps {
  revision: ProjectRevision;
}

export const RevisionDiff: React.FC<RevisionDiffProps> = ({ revision }) => {
  const { previousSnapshot, proposedChanges } = revision;

  const fieldsToCompare: Array<{ key: string; label: string }> = [
    { key: 'title', label: 'Project Title' },
    { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category' },
    { key: 'projectStatus', label: 'Project Status' },
    { key: 'liveWebsiteUrl', label: 'Live Website URL' },
    { key: 'githubRepoUrl', label: 'GitHub Repository' },
    { key: 'technologies', label: 'Technologies' },
    { key: 'coverImageUrl', label: 'Cover Image' },
    { key: 'screenshots', label: 'Screenshots & Media' },
  ];

  const renderValue = (val: any) => {
    if (val === undefined || val === null || val === '') {
      return <span className="text-slate-400 italic">None</span>;
    }
    if (Array.isArray(val)) {
      // Check if it's an array of image URLs (screenshots)
      const isImageArray = val.length > 0 && typeof val[0] === 'string' && (
        val[0].startsWith('http') || val[0].startsWith('data:image/') || val[0].startsWith('blob:')
      );
      if (isImageArray) {
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {val.map((imgUrl, i) => (
              <div key={i} className="relative h-16 rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={imgUrl}
                  alt={`Screenshot ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-mono text-center py-0.5">
                  #{i + 1}
                </span>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="flex flex-wrap gap-1">
          {val.map((item) => (
            <span key={item} className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px] font-mono">
              {item}
            </span>
          ))}
        </div>
      );
    }
    if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'))) {
      return (
        <img src={val} alt="Preview" className="w-24 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" />
      );
    }
    return <span className="text-slate-800 break-words">{String(val)}</span>;
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
        <span className="font-semibold text-indigo-950 block">Employee Change Summary:</span>
        <p className="text-indigo-900 mt-0.5">{revision.changeSummary}</p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        <div className="grid grid-cols-2 bg-slate-50 font-sans font-semibold text-slate-600 px-4 py-2 uppercase text-[10px] tracking-wider">
          <div>Current Live Version</div>
          <div>Proposed Revision Updates</div>
        </div>

        {fieldsToCompare.map(({ key, label }) => {
          const prevVal = previousSnapshot[key];
          const nextVal = proposedChanges[key as keyof typeof proposedChanges];

          const isChanged =
            JSON.stringify(prevVal ?? null) !== JSON.stringify(nextVal ?? null) &&
            nextVal !== undefined;

          if (!isChanged && nextVal === undefined) {
            return null; // Unchanged field
          }

          return (
            <div
              key={key}
              className={`p-4 transition-colors ${
                isChanged ? 'bg-amber-50/40' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono font-bold text-slate-500 uppercase text-[10px]">
                  {label}
                </span>
                {isChanged && (
                  <Badge variant="pink" size="sm">
                    Modified
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">
                    Before:
                  </span>
                  {renderValue(prevVal)}
                </div>

                <div
                  className={`p-2.5 rounded-lg border ${
                    isChanged
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50/80 border-slate-200/60'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">
                    Proposed:
                  </span>
                  {renderValue(nextVal ?? prevVal)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

