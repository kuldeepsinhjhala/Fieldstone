import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [dirHandle, setDirHandle] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState({ message: '', type: 'idle' });

  const showStatus = useCallback((message, type = 'success') => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: '', type: 'idle' }), 3000);
  }, []);

  const loadDirectory = useCallback(async (handle) => {
    setDirHandle(handle);
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
    showStatus(`Loaded ${jsonFiles.length} JSON file(s)`, 'success');
  }, [showStatus]);

  const openFile = useCallback(async (fileEntry) => {
    try {
      const file = await fileEntry.handle.getFile();
      const text = await file.text();
      const parsed = JSON.parse(text);
      setActiveFile(fileEntry);
      setJsonData(parsed);
      setIsDirty(false);
    } catch (e) {
      showStatus(`Error reading file: ${e.message}`, 'error');
    }
  }, [showStatus]);

  const updateData = useCallback((newData) => {
    setJsonData(newData);
    setIsDirty(true);
  }, []);

  const saveFile = useCallback(async () => {
    if (!activeFile || jsonData === null) return;
    try {
      const writable = await activeFile.handle.createWritable();
      await writable.write(JSON.stringify(jsonData, null, 2));
      await writable.close();
      setIsDirty(false);
      showStatus('File saved successfully', 'success');
    } catch (e) {
      showStatus(`Save failed: ${e.message}`, 'error');
    }
  }, [activeFile, jsonData, showStatus]);

  const createFile = useCallback(async (fileName) => {
    if (!dirHandle) return;
    const name = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    try {
      const fileHandle = await dirHandle.getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write('{}');
      await writable.close();
      const newEntry = { name, handle: fileHandle };
      setFiles(prev => [...prev, newEntry].sort((a, b) => a.name.localeCompare(b.name)));
      await openFile(newEntry);
      showStatus(`Created ${name}`, 'success');
    } catch (e) {
      showStatus(`Create failed: ${e.message}`, 'error');
    }
  }, [dirHandle, openFile, showStatus]);

  const deleteFile = useCallback(async () => {
    if (!activeFile || !dirHandle) return;
    try {
      await dirHandle.removeEntry(activeFile.name);
      setFiles(prev => prev.filter(f => f.name !== activeFile.name));
      setActiveFile(null);
      setJsonData(null);
      setIsDirty(false);
      showStatus(`Deleted ${activeFile.name}`, 'success');
    } catch (e) {
      showStatus(`Delete failed: ${e.message}`, 'error');
    }
  }, [activeFile, dirHandle, showStatus]);

  return (
    <AppContext.Provider value={{
      dirHandle, files, activeFile, jsonData, isDirty, status,
      loadDirectory, openFile, updateData, saveFile, createFile, deleteFile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
