import React, { useState } from 'react';
import {
  Smartphone,
  Plus,
  Search,
  X,
  History,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';
import { CompatibleDevice } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const DevicesView: React.FC = () => {
  const {
    devices,
    testSessions,
    selectedDeviceId,
    addDevice,
    deactivateDevice,
    activateDevice,
    openConfirmDialog,
    navigate,
  } = useConsole();

  const [search, setSearch] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<CompatibleDevice | null>(
    devices.find((d) => d.id === selectedDeviceId) || null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('Google');
  const [androidVersion, setAndroidVersion] = useState('Android 15');
  const [chipset, setChipset] = useState('Qualcomm Snapdragon 8 Gen 3');

  const filteredDevices = devices.filter(
    (d) =>
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.modelNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.manufacturer.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addDevice({
      name,
      modelNumber,
      manufacturer,
      androidVersion,
      chipset,
    });

    setName('');
    setModelNumber('');
    setIsAddModalOpen(false);
  };

  const handleToggleStatus = (device: CompatibleDevice) => {
    if (device.status === 'ACTIVE') {
      openConfirmDialog({
        title: 'Deactivate Compatible Device',
        actionName: 'DEACTIVATE_DEVICE',
        resourceDetails: `${device.name} (${device.modelNumber}, ID: ${device.id})`,
        warningNote:
          'Hard delete is prohibited to preserve integrity of historical testing records. Deactivating marks the device inactive in exploratory test runners.',
        confirmButtonText: 'Deactivate Device',
        onConfirm: () => {
          deactivateDevice(device.id);
          if (selectedDevice?.id === device.id) {
            setSelectedDevice({ ...selectedDevice, status: 'INACTIVE' });
          }
        },
      });
    } else {
      activateDevice(device.id);
      if (selectedDevice?.id === device.id) {
        setSelectedDevice({ ...selectedDevice, status: 'ACTIVE' });
      }
    }
  };

  const deviceTests = testSessions.filter((t) => t.deviceId === selectedDevice?.id);

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            OPERATIONS / HARDWARE
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            Compatible Devices
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1">
            Certified Android hardware registry for on-device threat verification.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium text-xs rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Device</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 py-3 border-y border-[#252930] text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#9AA0A6] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search devices..."
            className="w-full bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-1.5 text-xs text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
          />
        </div>

        <div className="text-xs text-[#9AA0A6] font-mono">
          <span>Active: <strong className="text-[#81C995] font-normal">{devices.filter(d => d.status === 'ACTIVE').length}</strong></span>
          <span className="mx-2 text-[#252930]">|</span>
          <span>Total: <strong className="text-[#F1F3F4] font-normal">{devices.length}</strong></span>
        </div>
      </div>

      {/* Clean Table (as specified in Section 19) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#252930] text-[11px] font-mono uppercase text-[#9AA0A6] tracking-wider">
              <th className="py-2.5 px-3">DEVICE</th>
              <th className="py-2.5 px-3">MODEL</th>
              <th className="py-2.5 px-3">MANUFACTURER</th>
              <th className="py-2.5 px-3">ANDROID</th>
              <th className="py-2.5 px-3">CHIPSET</th>
              <th className="py-2.5 px-3">STATUS</th>
              <th className="py-2.5 px-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F232B]">
            {filteredDevices.map((device) => (
              <tr
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className="hover:bg-[#101216] cursor-pointer transition-colors"
              >
                <td className="py-3 px-3 font-medium text-[#F1F3F4]">
                  {device.name}
                </td>
                <td className="py-3 px-3 font-mono text-[#8AB4F8]">
                  {device.modelNumber}
                </td>
                <td className="py-3 px-3 text-[#9AA0A6]">
                  {device.manufacturer}
                </td>
                <td className="py-3 px-3 text-[#F1F3F4]">
                  {device.androidVersion}
                </td>
                <td className="py-3 px-3 text-[#9AA0A6] font-mono text-[11px]">
                  {device.chipset}
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={device.status} size="sm" />
                </td>
                <td className="py-3 px-3 text-right space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDevice(device);
                    }}
                    className="text-[#8AB4F8] hover:underline cursor-pointer"
                  >
                    History
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(device);
                    }}
                    className={`cursor-pointer ${
                      device.status === 'ACTIVE'
                        ? 'text-[#F28B82] hover:underline'
                        : 'text-[#81C995] hover:underline'
                    }`}
                  >
                    {device.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DEVICE DETAILS DRAWER */}
      {selectedDevice && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-2xs"
          onClick={() => setSelectedDevice(null)}
        >
          <div
            className="w-full max-w-lg h-full bg-[#0A0B0D] border-l border-[#252930] shadow-2xl p-6 overflow-y-auto space-y-6 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#252930]">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-base text-[#F1F3F4]">{selectedDevice.name}</span>
                <StatusBadge status={selectedDevice.status} size="sm" />
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-[#9AA0A6] hover:text-[#F1F3F4] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#252930] font-mono text-[11px]">
              <div>
                <span className="text-[#6F757D] block uppercase">MODEL</span>
                <span className="text-[#F1F3F4]">{selectedDevice.modelNumber}</span>
              </div>
              <div>
                <span className="text-[#6F757D] block uppercase">OEM</span>
                <span className="text-[#F1F3F4]">{selectedDevice.manufacturer}</span>
              </div>
              <div>
                <span className="text-[#6F757D] block uppercase">ANDROID OS</span>
                <span className="text-[#F1F3F4]">{selectedDevice.androidVersion}</span>
              </div>
              <div>
                <span className="text-[#6F757D] block uppercase">TOTAL RUNS</span>
                <span className="text-[#8AB4F8]">{selectedDevice.testingHistoryCount}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#6F757D] block uppercase">CHIPSET</span>
                <span className="text-[#F1F3F4]">{selectedDevice.chipset}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
                  Historical Test Runs ({deviceTests.length})
                </div>
                <button
                  onClick={() => {
                    const id = selectedDevice.id;
                    setSelectedDevice(null);
                    navigate('quick-test');
                  }}
                  className="text-xs text-[#8AB4F8] hover:underline cursor-pointer"
                >
                  + Run test
                </button>
              </div>

              {deviceTests.length === 0 ? (
                <div className="p-4 bg-[#101216] border border-[#252930] rounded-[4px] text-center text-[#6F757D]">
                  No historical test runs recorded for this device.
                </div>
              ) : (
                <div className="divide-y divide-[#1F232B] border border-[#252930] rounded-[4px] bg-[#101216]">
                  {deviceTests.map((t) => (
                    <div key={t.id} className="p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[#8AB4F8]">{t.id}</span>
                        <StatusBadge status={t.outcome} size="sm" />
                      </div>
                      <div className="text-[#F1F3F4]">{t.scenarioName}</div>
                      <div className="text-[11px] text-[#6F757D] font-mono flex items-center justify-between pt-1">
                        <span>Tester: {t.testerName}</span>
                        <span>{new Date(t.startedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#252930]">
              <button
                onClick={() => handleToggleStatus(selectedDevice)}
                className={`w-full py-2 rounded-[4px] text-xs font-medium cursor-pointer transition-colors ${
                  selectedDevice.status === 'ACTIVE'
                    ? 'bg-transparent border border-[#30343A] hover:bg-[#15181D] text-[#F28B82]'
                    : 'bg-[#15181D] hover:bg-[#1A1D22] border border-[#252930] text-[#81C995]'
                }`}
              >
                {selectedDevice.status === 'ACTIVE' ? 'Deactivate Device' : 'Activate Device'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DEVICE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl p-6 text-[#F1F3F4] text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#252930] mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F1F3F4]">
                Add Compatible Device
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#9AA0A6] hover:text-[#F1F3F4]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Device Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Google Pixel 9 Pro"
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
                />
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Model Number *
                </label>
                <input
                  type="text"
                  required
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  placeholder="e.g. GC15S"
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#F1F3F4]"
                  />
                </div>
                <div>
                  <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                    Android Version
                  </label>
                  <input
                    type="text"
                    value={androidVersion}
                    onChange={(e) => setAndroidVersion(e.target.value)}
                    className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#F1F3F4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Chipset / NPU
                </label>
                <input
                  type="text"
                  value={chipset}
                  onChange={(e) => setChipset(e.target.value)}
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#252930]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-[#9AA0A6] hover:text-[#F1F3F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium rounded-[4px] cursor-pointer"
                >
                  Add Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
