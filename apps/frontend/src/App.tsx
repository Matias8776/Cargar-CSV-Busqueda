import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import './App.css';
import { uploadFile } from './services/upload';
import { Data } from './types';
import { Search } from './components/Search';

const APP_STATUS = {
  IDLE: 'idle',
  ERROR: 'error',
  READY_TO_UPLOAD: 'ready_to_upload',
  UPLOADING: 'uploading',
  SUCCESS: 'success'
} as const;

const BUTTON_TEXT = {
  [APP_STATUS.READY_TO_UPLOAD]: 'Subir archivo',
  [APP_STATUS.UPLOADING]: 'Subiendo...'
};

type AppStatus = (typeof APP_STATUS)[keyof typeof APP_STATUS];

function App() {
  const [appStatus, setAppStatus] = useState<AppStatus>(APP_STATUS.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Data>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = e.target.files ?? [];

    if (file) {
      setFile(file);
      setAppStatus(APP_STATUS.READY_TO_UPLOAD);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (appStatus !== APP_STATUS.READY_TO_UPLOAD || !file) {
      return;
    }

    setAppStatus(APP_STATUS.UPLOADING);

    const [error, newData] = await uploadFile(file);

    if (error) {
      setAppStatus(APP_STATUS.ERROR);
      toast.error(error.message);
      return;
    } else {
      setAppStatus(APP_STATUS.SUCCESS);
      if (newData) setData(newData);
      toast.success('Archivo subido correctamente');
    }
  };

  const showButton =
    appStatus === APP_STATUS.READY_TO_UPLOAD ||
    appStatus === APP_STATUS.UPLOADING;
  const showInput = appStatus !== APP_STATUS.SUCCESS;

  return (
    <>
      <Toaster />
      <h4>Cargar CSV + Búsqueda</h4>
      {showInput && (
        <form onSubmit={handleSubmit}>
          <label>
            <input
              disabled={appStatus === APP_STATUS.UPLOADING}
              onChange={handleInputChange}
              type='file'
              name='file'
              accept='.csv'
            />
          </label>
          {showButton && (
            <button disabled={appStatus === APP_STATUS.UPLOADING}>
              {BUTTON_TEXT[appStatus]}
            </button>
          )}
        </form>
      )}

      {appStatus === APP_STATUS.SUCCESS && (
        <section>
          <Search initialData={data} />
        </section>
      )}
    </>
  );
}

export default App;
