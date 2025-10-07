/**
 * Example React Component for AI Model Selection
 * 
 * This is a conceptual example showing how to integrate the model selection
 * feature into a React UI. You can adapt this for your specific needs.
 * 
 * Usage:
 * import { ModelSelector } from './components/features/ModelSelector';
 * 
 * <ModelSelector />
 */

import React, { useState, useEffect } from 'react';
import {
  getAllModels,
  getModelsByType,
  getCurrentModel,
  switchModel,
  initializeAI,
  ModelInfo,
} from '../../services/ai';

interface ModelSelectorProps {
  onModelChange?: (model: ModelInfo) => void;
  showTypeFilter?: boolean;
  autoInitialize?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  onModelChange,
  showTypeFilter = true,
  autoInitialize = false,
}) => {
  const [allModels] = useState<ModelInfo[]>(getAllModels());
  const [currentModel, setCurrentModel] = useState<ModelInfo | null>(getCurrentModel());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'llm' | 'embedding'>('all');
  const [initialized, setInitialized] = useState(false);

  // Auto-initialize on mount if requested
  useEffect(() => {
    if (autoInitialize && !initialized) {
      handleInitialize();
    }
  }, [autoInitialize, initialized]);

  const handleInitialize = async () => {
    setLoading(true);
    setError(null);
    try {
      await initializeAI();
      setCurrentModel(getCurrentModel());
      setInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    } finally {
      setLoading(false);
    }
  };

  const handleModelSwitch = async (modelId: string) => {
    setLoading(true);
    setError(null);
    try {
      await switchModel(modelId);
      const newModel = getCurrentModel();
      setCurrentModel(newModel);
      if (newModel && onModelChange) {
        onModelChange(newModel);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch model');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredModels = (): ModelInfo[] => {
    if (filterType === 'all') {
      return allModels;
    }
    return getModelsByType(filterType);
  };

  const filteredModels = getFilteredModels();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>AI Model Selection</h2>

      {currentModel && (
        <div style={styles.currentModel}>
          <strong>Current Model:</strong> {currentModel.name}
          <div style={styles.modelInfo}>
            <span>Type: {currentModel.type}</span>
            <span>Dimension: {currentModel.dimension}</span>
          </div>
        </div>
      )}

      {!initialized && (
        <button
          onClick={handleInitialize}
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'Initializing...' : 'Initialize AI Service'}
        </button>
      )}

      {showTypeFilter && initialized && (
        <div style={styles.filterContainer}>
          <label>Filter by Type: </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            style={styles.select}
          >
            <option value="all">All Models</option>
            <option value="llm">Language Models</option>
            <option value="embedding">Embedding Models</option>
          </select>
        </div>
      )}

      {error && (
        <div style={styles.error}>
          Error: {error}
        </div>
      )}

      {loading && (
        <div style={styles.loading}>
          {initialized ? 'Switching model...' : 'Initializing...'}
          <br />
          <small>This may take a moment on first download</small>
        </div>
      )}

      {initialized && (
        <div style={styles.modelList}>
          {filteredModels.map((model) => (
            <div
              key={model.id}
              style={{
                ...styles.modelCard,
                ...(currentModel?.id === model.id ? styles.modelCardActive : {}),
              }}
            >
              <div style={styles.modelHeader}>
                <h3 style={styles.modelName}>{model.name}</h3>
                <span style={styles.modelType}>{model.type}</span>
              </div>
              <p style={styles.modelDescription}>{model.description}</p>
              <div style={styles.modelDetails}>
                <span>Dimension: {model.dimension}</span>
                <span>HF: {model.modelName}</span>
              </div>
              <button
                onClick={() => handleModelSwitch(model.id)}
                disabled={loading || currentModel?.id === model.id}
                style={{
                  ...styles.button,
                  ...(currentModel?.id === model.id ? styles.buttonActive : {}),
                }}
              >
                {currentModel?.id === model.id ? 'Active' : 'Switch to this model'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  currentModel: {
    padding: '15px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  modelInfo: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px',
    fontSize: '14px',
    color: '#666',
  },
  filterContainer: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee',
    color: '#c00',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#ffe',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  modelList: {
    display: 'grid',
    gap: '15px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  },
  modelCard: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  modelCardActive: {
    border: '2px solid #007bff',
    backgroundColor: '#f0f8ff',
  },
  modelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  modelName: {
    fontSize: '18px',
    margin: 0,
  },
  modelType: {
    fontSize: '12px',
    padding: '4px 8px',
    backgroundColor: '#eee',
    borderRadius: '4px',
  },
  modelDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px',
  },
  modelDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    fontSize: '12px',
    color: '#888',
    marginBottom: '15px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
  buttonActive: {
    backgroundColor: '#28a745',
    cursor: 'default',
  },
};

export default ModelSelector;
