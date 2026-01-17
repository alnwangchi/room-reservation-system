import { Listbox } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

/**
 * 通用的下拉選單元件
 * @param {any} value - 選中的值
 * @param {Function} onChange - 變更處理函數
 * @param {Array} options - 選項陣列，格式為 { value, label } 或任意物件
 * @param {string} placeholder - 預設顯示文字
 * @param {string} className - 外層容器樣式
 * @param {string} label - 標題文字（可選）
 * @param {Function} getDisplayValue - 自訂顯示值的函數，接收選中值，返回顯示文字
 * @param {Function} renderOption - 自訂選項渲染函數，接收 (option, { selected, active })，返回 React 元素
 * @param {'left' | 'right'} checkmarkPosition - 選中標記位置，預設 'right'
 * @param {string} buttonClassName - 按鈕額外樣式
 * @param {string} optionsClassName - 選項列表額外樣式
 */
function DropSelector({
  value,
  onChange,
  options = [],
  placeholder = '請選擇',
  className = '',
  label,
  getDisplayValue,
  renderOption,
  checkmarkPosition = 'right',
  buttonClassName = '',
  optionsClassName = '',
}) {
  // 取得顯示值
  const getDisplayText = () => {
    if (getDisplayValue) {
      return getDisplayValue(value);
    }
    // 預設邏輯：如果是物件陣列，嘗試找 value 屬性
    if (
      options.length > 0 &&
      typeof options[0] === 'object' &&
      'value' in options[0]
    ) {
      const option = options.find(opt => opt.value === value);
      return option?.label || placeholder;
    }
    // 如果是物件陣列但沒有 value 屬性，直接顯示物件本身
    if (value && typeof value === 'object') {
      return value.displayName || value.email || value.id || placeholder;
    }
    return placeholder;
  };

  // 預設選項渲染
  const defaultRenderOption = (option, { selected, active }) => {
    const label =
      typeof option === 'object' && 'label' in option
        ? option.label
        : option.displayName || option.email || option.id || String(option);

    const checkmarkColor =
      checkmarkPosition === 'left'
        ? active
          ? 'text-indigo-600'
          : 'text-indigo-600'
        : active
          ? 'text-white'
          : 'text-blue-600';

    return (
      <>
        <span
          className={`block truncate ${
            selected ? 'font-medium' : 'font-normal'
          }`}
        >
          {label}
        </span>
        {selected && (
          <span
            className={`absolute inset-y-0 ${
              checkmarkPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-4'
            } flex items-center ${checkmarkColor}`}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </>
    );
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={`relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${buttonClassName}`}
          >
            <span className="block truncate">{getDisplayText()}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Listbox.Options
            className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${optionsClassName}`}
          >
            {options.map((option, index) => {
              // 判斷選項類型：
              // 1. 如果是 { value, label } 格式（有 value 且沒有 id），使用 value
              // 2. 如果是物件陣列（如 user 物件，有 id），直接使用整個物件
              // 3. 其他情況直接使用選項本身
              const hasValueProp =
                typeof option === 'object' &&
                'value' in option &&
                !('id' in option);
              const optionValue = hasValueProp ? option.value : option;
              const key =
                typeof option === 'object' && 'id' in option
                  ? option.id
                  : typeof option === 'object' && 'value' in option
                    ? option.value
                    : index;

              return (
                <Listbox.Option
                  key={key}
                  className={({ active }) => {
                    const baseClasses = `relative cursor-default select-none py-2 ${
                      checkmarkPosition === 'left' ? 'pl-10 pr-4' : 'pl-3 pr-9'
                    }`;
                    // 左側 checkmark 使用 indigo，右側使用 blue
                    const activeClasses =
                      checkmarkPosition === 'left'
                        ? active
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'text-gray-900'
                        : active
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-900';
                    return `${baseClasses} ${activeClasses}`;
                  }}
                  value={optionValue}
                >
                  {({ selected, active }) =>
                    renderOption
                      ? renderOption(option, { selected, active })
                      : defaultRenderOption(option, { selected, active })
                  }
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}

export default DropSelector;
