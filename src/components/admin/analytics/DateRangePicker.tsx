import { useState } from "react";
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown, RefreshCw, Download } from "lucide-react";

export type DateRange = "7d" | "30d" | "90d" | "custom";

interface DateRangePickerProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  onRefresh?: () => void;
  onExport?: (format: "csv" | "pdf") => void;
  isLoading?: boolean;
}

const DateRangePicker = ({ 
  selectedRange, 
  onRangeChange, 
  onRefresh,
  onExport,
  isLoading 
}: DateRangePickerProps) => {
  const { language } = useTranslation();
  const rangeLabels: Record<DateRange, string> = {
    "7d": language === 'he' ? '7 ימים' : language === 'es' ? '7 días' : '7 days',
    "30d": language === 'he' ? '30 יום' : language === 'es' ? '30 días' : '30 days',
    "90d": language === 'he' ? '90 יום' : language === 'es' ? '90 días' : '90 days',
    "custom": language === 'he' ? 'מותאם אישית' : language === 'es' ? 'Personalizado' : 'Custom',
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Date Range Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            {rangeLabels[selectedRange]}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onRangeChange("7d")}>
            {language === 'he' ? '7 ימים אחרונים' : language === 'es' ? 'Últimos 7 días' : 'Last 7 days'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRangeChange("30d")}>
            {language === 'he' ? '30 יום אחרונים' : language === 'es' ? 'Últimos 30 días' : 'Last 30 days'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRangeChange("90d")}>
            {language === 'he' ? '90 יום אחרונים' : language === 'es' ? 'Últimos 90 días' : 'Last 90 days'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Refresh Button */}
      {onRefresh && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      )}

      {/* Export Button */}
      {onExport && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              ייצוא
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("csv")}>
              ייצוא ל-CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("pdf")}>
              ייצוא ל-PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default DateRangePicker;
