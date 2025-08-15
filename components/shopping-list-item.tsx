'use client';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface ShoppingListItemProps {
  ingredient: Ingredient;
  checked: boolean;
  onToggle: () => void;
}

export function ShoppingListItem({ ingredient, checked, onToggle }: ShoppingListItemProps) {
  const formatAmount = (amount: number, unit: string) => {
    // Handle decimal amounts nicely
    const formattedAmount = amount % 1 === 0 ? amount.toString() : amount.toFixed(1);
    return `${formattedAmount} ${unit}${amount !== 1 ? 's' : ''}`;
  };

  return (
    <div
      className={`
        flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer
        ${checked 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0 mr-3">
        <div
          className={`
            w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
            ${checked 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Ingredient Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div
              className={`
                font-medium transition-all duration-200
                ${checked ? 'line-through text-green-600' : 'text-gray-900'}
              `}
            >
              {ingredient.name}
            </div>
          </div>
          <div
            className={`
              text-sm font-medium ml-3 transition-all duration-200
              ${checked ? 'text-green-600' : 'text-gray-500'}
            `}
          >
            {formatAmount(ingredient.amount, ingredient.unit)}
          </div>
        </div>
      </div>

      {/* Visual indicator */}
      <div className="flex-shrink-0 ml-2">
        {checked ? (
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        ) : (
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
        )}
      </div>
    </div>
  );
}