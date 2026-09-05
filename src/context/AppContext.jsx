import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const AppContext = createContext(null);

const UNDO_CAP = 40;
const UNDO_COALESCE_MS = 400;

export function AppProvider({ children }) {
  const [dirHandle, setDirHandle] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState({ message: '', type: 'idle' });
  const [saveError, setSaveError] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | error

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [confirmPrompt, setConfirmPrompt] = useState(null);

  const isDirtyRef = useRef(false);
  const jsonDataRef = useRef(null);
  const activeFileRef = useRef(null);
  const statusTimerRef = useRef(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const lastPushRef = useRef(0);
  const confirmResolverRef = useRef(null);

  useEffect(() => {
    isDirtyRef.current = isDirty;
    jsonDataRef.current = jsonData;
    activeFileRef.current = activeFile;
  });

  const showStatus = useCallback((message, type = 'success') => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    setStatus({ message, type });
    statusTimerRef.current = setTimeout(() => {
      setStatus({ message: '', type: 'idle' });
      statusTimerRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => () => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
  }, []);

  const confirm = useCallback((message) => {
    if (!message) message = 'Confirm';
    if (confirmResolverRef.current) {
      // Only one prompt at a time; resolve the previous one as cancelled.
      confirmResolverRef.current(false);
    }
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmPrompt({ message });
    });
  }, []);

  const respondConfirm = useCallback((result) => {
    const resolver = confirmResolverRef.current;
    confirmResolverRef.current = null;
    setConfirmPrompt(null);
    if (typeof resolver === 'function') resolver(result);
  }, []);

  const confirmLeave = useCallback(async () => {
    if (!isDirtyRef.current) return true;
    return await confirm('You have unsaved changes. Discard them?');
  }, [confirm]);

  const clearUndo = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    lastPushRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const loadDirectory = useCallback(async (handle) => {
    if (!await confirmLeave()) return;
    setDirHandle(handle);
    setSaveError(null);
    setSaveState('idle');
    const jsonFiles = [];
    for await (const entry of handle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.json')) {
        jsonFiles.push({ name: entry.name, handle: entry });
      }
    }
    jsonFiles.sort((a, b) => a.name.localeCompare(b.name));
    setFiles(jsonFiles);
    setActiveFile(null);
    setJsonData(null);
    setIsDirty(false);
    activeFileRef.current = null;
    jsonDataRef.current = null;
    isDirtyRef.current = false;
    clearUndo();
    showStatus(`Loaded ${jsonFiles.length} JSON file(s)`, 'success');
  }, [confirmLeave, clearUndo, showStatus]);

  const openFile = useCallback(async (fileEntry, { skipConfirm } = {}) => {
    if (!skipConfirm && activeFileRef.current?.name === fileEntry.name) return;
    if (!skipConfirm && !await confirmLeave()) return;
    try {
      const file = await fileEntry.handle.getFile();
      const text = await file.text();
      const parsed = JSON.parse(text);
      setActiveFile(fileEntry);
      setJsonData(parsed);
      setIsDirty(false);
      activeFileRef.current = fileEntry;
      jsonDataRef.current = parsed;
      isDirtyRef.current = false;
      clearUndo();
      setSaveError(null);
      setSaveState('idle');
    } catch (e) {
      showStatus(`Error reading file: ${e.message}`, 'error');
    }
  }, [confirmLeave, clearUndo, showStatus]);

  const updateData = useCallback((newData) => {
    const now = Date.now();
    if (now - lastPushRef.current > UNDO_COALESCE_MS) {
      undoStackRef.current.push(jsonDataRef.current);
      if (undoStackRef.current.length > UNDO_CAP) undoStackRef.current.shift();
    }
    lastPushRef.current = now;
    jsonDataRef.current = newData;
    isDirtyRef.current = true;
    setJsonData(newData);
    setIsDirty(true);
    setCanUndo(undoStackRef.current.length > 0);
    // Any new edit invalidates redo history.
    redoStackRef.current = [];
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const current = jsonDataRef.current;
    const prev = undoStackRef.current.pop();
    redoStackRef.current.push(current);
    jsonDataRef.current = prev;
    isDirtyRef.current = true;
    setJsonData(prev);
    setIsDirty(true);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
    lastPushRef.current = 0;
  }, []);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const current = jsonDataRef.current;
    const next = redoStackRef.current.pop();
    undoStackRef.current.push(current);
    jsonDataRef.current = next;
    isDirtyRef.current = true;
    setJsonData(next);
    setIsDirty(true);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
    lastPushRef.current = 0;
  }, []);

  const saveFile = useCallback(async () => {
    if (!activeFile || jsonData === null) return;
    try {
      setSaveState('saving');
      setSaveError(null);
      const writable = await activeFile.handle.createWritable();
      await writable.write(JSON.stringify(jsonData, null, 2));
      await writable.close();
      setIsDirty(false);
      isDirtyRef.current = false;
      setSaveError(null);
      setSaveState('idle');
      showStatus('File saved successfully', 'success');
    } catch (e) {
      showStatus(`Save failed: ${e.message}`, 'error');
      setSaveState('error');
      setSaveError(e?.message || 'Save failed');
    }
  }, [activeFile, jsonData, showStatus]);

  const createFile = useCallback(async (fileName) => {
    if (!dirHandle) return;
    const name = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    const existsInList = files.some(f => f.name.toLowerCase() === name.toLowerCase());
    if (existsInList) {
      showStatus(`${name} already exists`, 'error');
      return;
    }
    try {
      await dirHandle.getFileHandle(name);
      showStatus(`${name} already exists`, 'error');
      return;
    } catch {
      // Not on disk yet.
    }
    if (!await confirmLeave()) return;
    try {
      const fileHandle = await dirHandle.getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write('{}');
      await writable.close();
      const newEntry = { name, handle: fileHandle };
      setFiles(prev => [...prev, newEntry].sort((a, b) => a.name.localeCompare(b.name)));
      await openFile(newEntry, { skipConfirm: true });
      showStatus(`Created ${name}`, 'success');
    } catch (e) {
      showStatus(`Create failed: ${e.message}`, 'error');
    }
  }, [dirHandle, files, confirmLeave, openFile, showStatus]);

  const deleteFile = useCallback(async () => {
    if (!activeFile || !dirHandle) return;
    if (!await confirmLeave()) return;
    try {
      await dirHandle.removeEntry(activeFile.name);
      setFiles(prev => prev.filter(f => f.name !== activeFile.name));
      setActiveFile(null);
      setJsonData(null);
      setIsDirty(false);
      activeFileRef.current = null;
      jsonDataRef.current = null;
      isDirtyRef.current = false;
      clearUndo();
      setSaveError(null);
      setSaveState('idle');
      showStatus(`Deleted ${activeFile.name}`, 'success');
    } catch (e) {
      showStatus(`Delete failed: ${e.message}`, 'error');
    }
  }, [activeFile, dirHandle, confirmLeave, clearUndo, showStatus]);

  return (
    <AppContext.Provider value={{
      dirHandle, files, activeFile, jsonData, isDirty, status, canUndo,
      canRedo,
      saveError,
      saveState,
      confirmPrompt,
      loadDirectory, openFile, updateData, saveFile, createFile, deleteFile, undo, redo,
      confirm, respondConfirm,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);