import React, { useState, useEffect } from 'react';
import {
  Play,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';
import { TestOutcome, TestEvidence, CompatibleDevice, TestingObjective } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const QuickTestWizard: React.FC = () => {
  const {
    currentUser,
    objectives,
    devices,
    submitTestSession,
    navigate,
  } = useConsole();

  const [currentStep, setCurrentStep] = useState(1);

  const [selectedObjective, setSelectedObjective] = useState<TestingObjective>(objectives[0]);
  const [selectedDevice, setSelectedDevice] = useState<CompatibleDevice>(
    devices.find((d) => d.status === 'ACTIVE') || devices[0]
  );

  const [appVersion, setAppVersion] = useState('v2.4.0-rc1');
  const [sessionStartTime] = useState(new Date().toISOString());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [scenarioName, setScenarioName] = useState('Urgent Bank OTP Phishing Audio Stream');
  const [description, setDescription] = useState(
    'Playback of calibrated 45s audio recording containing urgent OTP demand into microphone at 72dB SPL.'
  );
  const [expectedResult, setExpectedResult] = useState(
    'HUD overlay triggers in <3.5s with "CRITICAL: Urgent OTP Request" warning.'
  );
  const [actualResult, setActualResult] = useState(
    'HUD overlay triggered in 2.9s. Local acoustic DSP classifier score 95.1%.'
  );
  const [outcome, setOutcome] = useState<TestOutcome>('PASS');

  const [evidenceList, setEvidenceList] = useState<TestEvidence[]>([
    {
      id: 'ev-temp-1',
      name: 'pixel_otp_call_hud_overlay.png',
      type: 'SCREENSHOT',
      size: '1.6 MB',
      timestamp: new Date().toISOString(),
      snippet: 'HUD prompt confirmed visible over in-call screen.',
    },
    {
      id: 'ev-temp-2',
      name: 'logcat_dsp_audio_stream.log',
      type: 'LOG',
      size: '340 KB',
      timestamp: new Date().toISOString(),
      snippet: 'AudioRecord thread active; latency 18ms per inference cycle.',
    },
  ]);
  const [newEvidenceName, setNewEvidenceName] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState<TestEvidence['type']>('SCREENSHOT');
  const [testerNotes, setTesterNotes] = useState(
    'No acoustic artifacts detected. Bluetooth SCO handover was not invoked during this session.'
  );

  const [submittedTestId, setSubmittedTestId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddEvidence = () => {
    if (!newEvidenceName.trim()) return;
    const newEv: TestEvidence = {
      id: `ev-${Date.now()}`,
      name: newEvidenceName,
      type: newEvidenceType,
      size: `${Math.floor(100 + Math.random() * 800)} KB`,
      timestamp: new Date().toISOString(),
      snippet: 'Uploaded by tester.',
    };
    setEvidenceList([...evidenceList, newEv]);
    setNewEvidenceName('');
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList(evidenceList.filter((e) => e.id !== id));
  };

  const handleSubmit = async () => {
    const testId = await submitTestSession({
      objectiveId: selectedObjective.id,
      objectiveTitle: selectedObjective.title,
      deviceId: selectedDevice.id,
      deviceName: selectedDevice.name,
      deviceModel: selectedDevice.modelNumber,
      androidVersion: selectedDevice.androidVersion,
      appVersion,
      startedAt: sessionStartTime,
      scenarioName,
      description,
      expectedResult,
      actualResult,
      outcome,
      evidence: evidenceList,
      testerNotes,
    });
    setSubmittedTestId(testId);
  };

  if (submittedTestId) {
    return (
      <div className="p-8 max-w-lg mx-auto my-16 bg-[#101216] border border-[#252930] rounded-[4px] text-center space-y-5">
        <CheckCircle2 className="w-10 h-10 text-[#81C995] mx-auto" />
        <div>
          <div className="text-[11px] font-mono text-[#8AB4F8] uppercase tracking-wider">
            SUBMISSION QUEUED
          </div>
          <h2 className="text-xl font-semibold text-[#F1F3F4] mt-1 font-mono">
            {submittedTestId} Under Review
          </h2>
          <p className="text-xs text-[#9AA0A6] mt-1.5">
            Test results and evidence files are ready for quality gate review.
          </p>
        </div>

        <div className="p-3 bg-[#0B0C0E] border border-[#252930] rounded-[4px] text-left text-xs font-mono space-y-1.5 text-[#9AA0A6]">
          <div className="flex justify-between">
            <span>DEVICE:</span>
            <span className="text-[#F1F3F4]">{selectedDevice.name}</span>
          </div>
          <div className="flex justify-between">
            <span>OUTCOME:</span>
            <StatusBadge status={outcome} size="sm" />
          </div>
          <div className="flex justify-between">
            <span>STATUS:</span>
            <StatusBadge status="UNDER_REVIEW" size="sm" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('testing')}
            className="px-4 py-1.5 rounded-[4px] bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium text-xs cursor-pointer"
          >
            Back to Testing
          </button>
          <button
            onClick={() => {
              setSubmittedTestId(null);
              setCurrentStep(1);
            }}
            className="px-4 py-1.5 rounded-[4px] bg-transparent hover:bg-[#15181D] text-[#F1F3F4] border border-[#30343A] text-xs cursor-pointer"
          >
            Start Another Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            OPERATIONS / TESTING
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            Quick Test
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1">
            Manual testing protocol across certified Android hardware devices.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#9AA0A6]">
          <Clock className="w-3.5 h-3.5 text-[#8AB4F8]" />
          <span>ELAPSED:</span>
          <span className="text-[#F1F3F4] tabular-nums font-medium">{formatElapsed(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Horizontal Step Indicator (Section 17: Objective → Device → Test → Evidence → Submit) */}
      <div className="flex items-center justify-between py-2.5 px-3 border-y border-[#252930] text-xs font-mono text-[#9AA0A6]">
        {[
          { num: 1, label: 'Objective' },
          { num: 2, label: 'Device' },
          { num: 3, label: 'Session' },
          { num: 4, label: 'Result' },
          { num: 5, label: 'Evidence' },
          { num: 6, label: 'Submit' },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            {idx > 0 && <span className="text-[#6F757D]">→</span>}
            <button
              onClick={() => s.num < currentStep && setCurrentStep(s.num)}
              className={`cursor-pointer ${
                currentStep === s.num
                  ? 'text-[#8AB4F8] font-semibold'
                  : currentStep > s.num
                  ? 'text-[#F1F3F4]'
                  : 'text-[#6F757D]'
              }`}
            >
              {s.num}. {s.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: OBJECTIVE */}
      {currentStep === 1 && (
        <div className="space-y-4 text-xs">
          <div className="text-sm font-medium text-[#F1F3F4]">
            Select Testing Objective
          </div>
          <div className="divide-y divide-[#1F232B] border border-[#252930] rounded-[4px] bg-[#101216]">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                onClick={() => setSelectedObjective(obj)}
                className={`p-3.5 cursor-pointer transition-colors ${
                  selectedObjective?.id === obj.id
                    ? 'bg-[#15181D] border-l-2 border-[#8AB4F8]'
                    : 'hover:bg-[#1A1D22]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[#8AB4F8] font-medium">{obj.id}</span>
                  <span className="text-[11px] text-[#6F757D] font-mono">{obj.targetAppVersion}</span>
                </div>
                <div className="text-[#F1F3F4] font-medium mb-1">{obj.title}</div>
                <p className="text-[#9AA0A6] leading-relaxed">{obj.description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-1.5 rounded-[4px] bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Device</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DEVICE */}
      {currentStep === 2 && (
        <div className="space-y-4 text-xs">
          <div className="text-sm font-medium text-[#F1F3F4]">
            Select Compatible Device
          </div>
          <div className="divide-y divide-[#1F232B] border border-[#252930] rounded-[4px] bg-[#101216]">
            {devices.map((device) => {
              const isSelected = selectedDevice?.id === device.id;
              const isInactive = device.status === 'INACTIVE';
              return (
                <div
                  key={device.id}
                  onClick={() => !isInactive && setSelectedDevice(device)}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    isInactive
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#15181D] border-l-2 border-[#8AB4F8] cursor-pointer'
                      : 'hover:bg-[#1A1D22] cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="text-[#F1F3F4] font-medium">{device.name}</div>
                    <div className="text-[11px] text-[#9AA0A6] font-mono mt-0.5">
                      Model: {device.modelNumber} · {device.manufacturer} · {device.androidVersion}
                    </div>
                  </div>
                  <StatusBadge status={device.status} size="sm" />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-3.5 py-1.5 rounded-[4px] bg-transparent hover:bg-[#15181D] text-[#F1F3F4] border border-[#30343A] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-1.5 rounded-[4px] bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SESSION */}
      {currentStep === 3 && (
        <div className="space-y-4 text-xs">
          <div className="text-sm font-medium text-[#F1F3F4]">
            Session Configuration
          </div>

          <div className="grid grid-cols-2 gap-4 p-3 bg-[#101216] border border-[#252930] rounded-[4px] font-mono text-[11px]">
            <div>
              <span className="text-[#6F757D] block uppercase">Objective</span>
              <span className="text-[#F1F3F4]">{selectedObjective.title}</span>
            </div>
            <div>
              <span className="text-[#6F757D] block uppercase">Hardware</span>
              <span className="text-[#F1F3F4]">{selectedDevice.name} ({selectedDevice.modelNumber})</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                App Version / Build
              </label>
              <input
                type="text"
                value={appVersion}
                onChange={(e) => setAppVersion(e.target.value)}
                className="w-full bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
              />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-3.5 py-1.5 rounded-[4px] bg-transparent hover:bg-[#15181D] text-[#F1F3F4] border border-[#30343A] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-1.5 rounded-[4px] bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Record Result</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RECORD RESULT */}
      {currentStep === 4 && (
        <div className="space-y-4 text-xs">
          <div className="text-sm font-medium text-[#F1F3F4]">
            Record Observations
          </div>

          <div>
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
              Scenario / Test Name *
            </label>
            <input
              type="text"
              required
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
            />
          </div>

          <div>
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                Expected Result
              </label>
              <textarea
                rows={3}
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                className="w-full bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
              />
            </div>
            <div>
              <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                Actual Result
              </label>
              <textarea
                rows={3}
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                className="w-full bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-2">
              Outcome *
            </label>
            <div className="grid grid-cols-4 gap-2 text-center">
              {(['PASS', 'FAIL', 'BLOCKED', 'NOT_TESTED'] as const).map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setOutcome(val)}
                  className={`py-2 rounded-[4px] border transition-colors cursor-pointer text-xs font-mono ${
                    outcome === val
                      ? 'bg-[#15181D] text-[#8AB4F8] border-[#8AB4F8] font-medium'
                      : 'bg-[#101216] text-[#9AA0A6] border-[#252930] hover:text-[#F1F3F4]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-3.5 py-1.5 rounded-[4px] bg-transparent hover:bg-[#15181D] text-[#F1F3F4] border border-[#30343A] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-4 py-1.5 rounded-[4px] bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Evidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: EVIDENCE */}
      {currentStep === 5 && (
        <div className="space-y-4 text-xs">
          <div className="text-sm font-medium text-[#F1F3F4]">
            Upload Evidence & Remarks
          </div>

          <div className="space-y-2">
            <div className="divide-y divide-[#1F232B] border border-[#252930] rounded-[4px] bg-[#101216]">
              {evidenceList.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 flex items-center justify-between font-mono text-[11px]"
                >
                  <div>
                    <span className="text-[#8AB4F8]">{ev.name}</span>
                    <span className="text-[#6F757D] ml-2">({ev.type} · {ev.size})</span>
                  </div>
                  <button
                    onClick={() => handleRemoveEvidence(ev.id)}
                    className="text-[#6F757D] hover:text-[#F28B82] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newEvidenceName}
                onChange={(e) => setNewEvidenceName(e.target.value)}
                placeholder="Filename e.g. logcat_stream.log"
                className="flex-1 bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-1.5 text-[#F1F3F4]"
              />
              <select
                value={newEvidenceType}
                onChange={(e) => setNewEvidenceType(e.target.value as any)}
                className="bg-[#101216] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#9AA0A6]"
              >
                <option value="SCREENSHOT">Screenshot</option>
                <option value="LOG">Log File</option>
                <option value="RECORDING">Screen Recording</option>
              </select>
              <button
                type="button"
                onClick={handleAddEvidence}
                className="px-3 py-1.5 rounded-[4px] bg-[#15181D] hover:bg-[#1A1D22] border border-[#252930] text-[#F1F3F4] cursor-pointer"
              >
                Attach
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
              Tester Notes
            </label>
            <textarea
              rows={3}
              value={testerNotes}
              onChange={(e) => setTesterNotes(e.target.value)}
              className="w-full bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-3.5 py-1.5 rounded-[4px] bg-transparent hover:bg-[#15181D] text-[#F1F3F4] border border-[#30343A] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              className="px-4 py-1.5 rounded-[4px] bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: SUBMIT */}
      {currentStep === 6 && (
        <div className="space-y-4 text-xs">
          <div className="text-sm font-medium text-[#F1F3F4]">
            Review & Finalize Submission
          </div>

          <div className="p-4 bg-[#101216] border border-[#252930] rounded-[4px] space-y-2.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#6F757D]">OBJECTIVE:</span>
              <span className="text-[#F1F3F4]">{selectedObjective.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6F757D]">DEVICE:</span>
              <span className="text-[#F1F3F4]">{selectedDevice.name} ({selectedDevice.modelNumber})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6F757D]">SCENARIO:</span>
              <span className="text-[#F1F3F4]">{scenarioName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6F757D]">OUTCOME:</span>
              <StatusBadge status={outcome} size="sm" />
            </div>
            <div className="flex justify-between">
              <span className="text-[#6F757D]">EVIDENCE ATTACHED:</span>
              <span className="text-[#8AB4F8]">{evidenceList.length} files</span>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(5)}
              className="px-3.5 py-1.5 rounded-[4px] bg-transparent hover:bg-[#15181D] text-[#F1F3F4] border border-[#30343A] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-[4px] bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit for Review</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
