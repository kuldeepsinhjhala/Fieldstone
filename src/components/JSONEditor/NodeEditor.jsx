import { getType } from '../../utils/jsonValue';
import {
  Toggle,
  StringEditor,
  NumberEditor,
  NullEditor,
} from './widgets/typeWidgets';
import ArrayEditor from './editors/ArrayEditor';
import ObjectEditor from './editors/ObjectEditor';

export default function NodeEditor({ value, onChange, depth = 0 }) {
  const type = getType(value);
  if (type === 'boolean') return <Toggle value={value} onChange={onChange} />;
  if (type === 'string') return <StringEditor value={value} onChange={onChange} />;
  if (type === 'number') return <NumberEditor value={value} onChange={onChange} />;
  if (type === 'null') return <NullEditor onChange={onChange} />;
  if (type === 'array') {
    return <ArrayEditor value={value} onChange={onChange} depth={depth} NodeEditorComponent={NodeEditor} />;
  }
  if (type === 'object') {
    return <ObjectEditor value={value} onChange={onChange} depth={depth} NodeEditorComponent={NodeEditor} />;
  }
  return null;
}
