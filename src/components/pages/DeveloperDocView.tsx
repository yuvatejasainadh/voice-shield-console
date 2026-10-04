import React, { useState, useEffect } from 'react';
import {
  Save,
  Send,
  GitPullRequest,
  GitCommit,
  Bug,
  Server,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';
import { WorkItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const DeveloperDocView: React.FC = () => {
  const {
    workItems,
    docs,
    selectedWorkId,
    selectedDocId,
    saveDoc,
  } = useConsole();

  const [selectedWork, setSelectedWork] = useState<WorkItem>(
    workItems.find((w) => w.id === selectedWorkId) || workItems[0]
  );

  const [whatIDid, setWhatIDid] = useState('');
  const [whyIDidIt, setWhyIDidIt] = useState('');
  const [changesMade, setChangesMade] = useState('');
  const [affectedComponents, setAffectedComponents] = useState('');
  const [problemsEncountered, setProblemsEncountered] = useState('');
  const [solutionApproach, setSolutionApproach] = useState('');
  const [testingPerformed, setTestingPerformed] = useState('');
  const [result, setResult] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  const [prNumber, setPrNumber] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [issueId, setIssueId] = useState('');
  const [deploymentId, setDeploymentId] = useState('');
  const [relatedTestId, setRelatedTestId] = useState('');

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    let docToLoad = docs.find((d) => d.id === selectedDocId);
    if (!docToLoad && selectedWork) {
      docToLoad = docs.find((d) => d.workId === selectedWork.id);
    }

    if (docToLoad) {
      setWhatIDid(docToLoad.whatIDid);
      setWhyIDidIt(docToLoad.whyIDidIt);
      setChangesMade(docToLoad.changesMade);
      setAffectedComponents(docToLoad.affectedComponents.join('\n'));
      setProblemsEncountered(docToLoad.problemsEncountered);
      setSolutionApproach(docToLoad.solutionApproach);
      setTestingPerformed(docToLoad.testingPerformed);
      setResult(docToLoad.result);
      setNextSteps(docToLoad.nextSteps);
      setPrNumber(docToLoad.references.prNumber || '');
      setCommitHash(docToLoad.references.commitHash || '');
      setIssueId(docToLoad.references.issueId || '');
      setDeploymentId(docToLoad.references.deploymentId || '');
      setRelatedTestId(docToLoad.references.relatedTestId || '');
    } else {
      setWhatIDid('');
      setWhyIDidIt('');
      setChangesMade('');
      setAffectedComponents('app/src/main/java/ai/voiceshield/engine/\ncore-native/audio/dsp/');
      setProblemsEncountered('');
      setSolutionApproach('');
      setTestingPerformed('');
      setResult('');
      setNextSteps('');
      setPrNumber('#');
      setCommitHash('');
      setIssueId('VS-');
      setDeploymentId('');
      setRelatedTestId('');
    }
  }, [selectedWork, selectedDocId, docs]);

  const activeDoc = docs.find((d) => d.workId === selectedWork?.id);

  const handleSave = (submit: boolean) => {
    const componentsList = affectedComponents
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    saveDoc(
      {
        id: activeDoc?.id,
        workId: selectedWork.id,
        workTitle: selectedWork.title,
        whatIDid,
        whyIDidIt,
        changesMade,
        affectedComponents: componentsList,
        problemsEncountered,
        solutionApproach,
        testingPerformed,
        result,
        nextSteps,
        references: {
          prNumber,
          commitHash,
          issueId,
          deploymentId,
          relatedTestId,
        },
      },
      submit
    );

    setNotificationMsg(
      submit
        ? 'Documentation submitted for Admin review.'
        : 'Draft saved successfully.'
    );
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            OPERATIONS / DOCUMENTATION
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            Engineering Documentation
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1">
            Structured technical submission for peer review and architectural audit trail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-3.5 py-1.5 rounded-[4px] bg-transparent hover:bg-[#15181D] text-[#F1F3F4] border border-[#30343A] text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="px-3.5 py-1.5 rounded-[4px] bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Review</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 rounded-[4px] bg-[#101216] border border-[#252930] text-[#81C995] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Target Work Item Selector */}
      <div className="p-4 bg-[#101216] border border-[#252930] rounded-[4px] space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[#9AA0A6] font-mono uppercase text-[11px]">
            Target Work Item
          </span>
          <select
            value={selectedWork?.id}
            onChange={(e) => {
              const item = workItems.find((w) => w.id === e.target.value);
              if (item) setSelectedWork(item);
            }}
            className="bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-1.5 text-xs text-[#F1F3F4] max-w-md focus:border-[#8AB4F8]"
          >
            {workItems.map((w) => (
              <option key={w.id} value={w.id}>
                {w.id} — {w.title}
              </option>
            ))}
          </select>
        </div>

        {activeDoc && (
          <div className="flex items-center gap-4 pt-2 border-t border-[#252930] text-[11px] font-mono text-[#9AA0A6]">
            <span>DOCUMENT ID: {activeDoc.id}</span>
            <span>VERSION: v{activeDoc.version}</span>
            <StatusBadge status={activeDoc.status} size="sm" />
          </div>
        )}

        {activeDoc?.reviewFeedback && (
          <div className="p-3 bg-[#15181D] border border-[#252930] rounded-[4px] text-xs">
            <div className="text-[11px] text-[#FDD663] font-mono uppercase mb-1">
              Feedback from {activeDoc.reviewerName || 'Reviewer'}:
            </div>
            <p className="text-[#F1F3F4] leading-relaxed">{activeDoc.reviewFeedback}</p>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase">
              1. What I Did *
            </label>
            <textarea
              rows={4}
              required
              value={whatIDid}
              onChange={(e) => setWhatIDid(e.target.value)}
              placeholder="Summary of code alterations, native routines, or system modifications..."
              className="w-full bg-[#101216] border border-[#252930] rounded-[4px] p-3 text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase">
              2. Why I Did It *
            </label>
            <textarea
              rows={4}
              required
              value={whyIDidIt}
              onChange={(e) => setWhyIDidIt(e.target.value)}
              placeholder="Root cause, thermal throttling symptoms, or compliance motive..."
              className="w-full bg-[#101216] border border-[#252930] rounded-[4px] p-3 text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase">
            3. Changes Made (Step-by-step)
          </label>
          <textarea
            rows={4}
            value={changesMade}
            onChange={(e) => setChangesMade(e.target.value)}
            placeholder="1. Bound native C++ library with JNI fastcall&#10;2. Configured circular RingBuffer reuse to prevent GC allocations&#10;3. Added flush-to-zero FP mode..."
            className="w-full bg-[#101216] border border-[#252930] rounded-[4px] p-3 text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase">
            4. Files / Components Affected (One per line)
          </label>
          <textarea
            rows={3}
            value={affectedComponents}
            onChange={(e) => setAffectedComponents(e.target.value)}
            className="w-full bg-[#101216] border border-[#252930] rounded-[4px] p-3 text-[#8AB4F8] font-mono text-[11px] focus:outline-hidden focus:border-[#8AB4F8]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase">
              5. Problems Encountered
            </label>
            <textarea
              rows={3}
              value={problemsEncountered}
              onChange={(e) => setProblemsEncountered(e.target.value)}
              placeholder="e.g. Subnormal float handling caused audio phase distortion on Snapdragon 8 Gen 3..."
              className="w-full bg-[#101216] border border-[#252930] rounded-[4px] p-3 text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase">
              6. Solution / Approach
            </label>
            <textarea
              rows={3}
              value={solutionApproach}
              onChange={(e) => setSolutionApproach(e.target.value)}
              placeholder="e.g. Configured denormal flush-to-zero in ARM control register FPSCR..."
              className="w-full bg-[#101216] border border-[#252930] rounded-[4px] p-3 text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase">
              7. Testing Performed
            </label>
            <textarea
              rows={3}
              value={testingPerformed}
              onChange={(e) => setTestingPerformed(e.target.value)}
              placeholder="e.g. 120-minute synthetic speech benchmark with 16kHz audio stream on Pixel 8..."
              className="w-full bg-[#101216] border border-[#252930] rounded-[4px] p-3 text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase">
              8. Result & Next Steps
            </label>
            <textarea
              rows={3}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="e.g. CPU load reduced to 3.4%. Ready for exploratory test on DEV-101..."
              className="w-full bg-[#101216] border border-[#252930] rounded-[4px] p-3 text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
            />
          </div>
        </div>

        {/* References Section */}
        <div className="space-y-2 pt-2 border-t border-[#252930]">
          <span className="text-[#9AA0A6] text-[11px] font-mono uppercase block">
            9. Technical References
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#6F757D] block mb-1">PR</span>
              <div className="flex items-center gap-1 bg-[#101216] border border-[#252930] rounded-[4px] px-2 py-1.5">
                <GitPullRequest className="w-3.5 h-3.5 text-[#8AB4F8] shrink-0" />
                <input
                  type="text"
                  value={prNumber}
                  onChange={(e) => setPrNumber(e.target.value)}
                  placeholder="#412"
                  className="w-full bg-transparent text-[#F1F3F4] outline-hidden text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#6F757D] block mb-1">COMMIT</span>
              <div className="flex items-center gap-1 bg-[#101216] border border-[#252930] rounded-[4px] px-2 py-1.5">
                <GitCommit className="w-3.5 h-3.5 text-[#9AA0A6] shrink-0" />
                <input
                  type="text"
                  value={commitHash}
                  onChange={(e) => setCommitHash(e.target.value)}
                  placeholder="8f9c1a7d"
                  className="w-full bg-transparent text-[#F1F3F4] outline-hidden text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#6F757D] block mb-1">ISSUE</span>
              <div className="flex items-center gap-1 bg-[#101216] border border-[#252930] rounded-[4px] px-2 py-1.5">
                <Bug className="w-3.5 h-3.5 text-[#9AA0A6] shrink-0" />
                <input
                  type="text"
                  value={issueId}
                  onChange={(e) => setIssueId(e.target.value)}
                  placeholder="VS-889"
                  className="w-full bg-transparent text-[#F1F3F4] outline-hidden text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#6F757D] block mb-1">DEPLOYMENT</span>
              <div className="flex items-center gap-1 bg-[#101216] border border-[#252930] rounded-[4px] px-2 py-1.5">
                <Server className="w-3.5 h-3.5 text-[#9AA0A6] shrink-0" />
                <input
                  type="text"
                  value={deploymentId}
                  onChange={(e) => setDeploymentId(e.target.value)}
                  placeholder="dep-stg"
                  className="w-full bg-transparent text-[#F1F3F4] outline-hidden text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#6F757D] block mb-1">TEST</span>
              <div className="flex items-center gap-1 bg-[#101216] border border-[#252930] rounded-[4px] px-2 py-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-[#8AB4F8] shrink-0" />
                <input
                  type="text"
                  value={relatedTestId}
                  onChange={(e) => setRelatedTestId(e.target.value)}
                  placeholder="TS-2001"
                  className="w-full bg-transparent text-[#F1F3F4] outline-hidden text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
