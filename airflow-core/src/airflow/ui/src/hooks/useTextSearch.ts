/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { useCallback } from "react";

export type SearchMatch = {
  lineNumber: number;
  lineText: string;
  isRegexPattern: boolean;
  pattern?: string;
};

export type UseTextSearchOptions = {
  enableRegex?: boolean;
  caseSensitive?: boolean;
  debugLogging?: boolean;
};

export const useTextSearch = (options: UseTextSearchOptions = {}) => {
  const { enableRegex = true, caseSensitive = false, debugLogging = false } = options;

  const searchInText = useCallback(
    (text: string, searchText: string): SearchMatch[] => {
      if (!searchText.trim()) {
        return [];
      }

      const lines = text.split('\n');
      const matches: SearchMatch[] = [];

      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        let isMatch = false;
        let isRegexPattern = false;
        let pattern: string | undefined;

        try {
          if (enableRegex && searchText.startsWith('%')) {
            // Regex pattern search
            pattern = searchText.slice(1);
            const regex = new RegExp(pattern, caseSensitive ? '' : 'i');
            isMatch = regex.test(line);
            isRegexPattern = true;

            if (debugLogging && isMatch) {
              console.log(`🔍 Regex match found:`, {
                pattern,
                lineText: line.trim(),
                lineNumber
              });
            }
          } else {
            // Regular text search
            const searchValue = caseSensitive ? searchText : searchText.toLowerCase();
            const lineValue = caseSensitive ? line : line.toLowerCase();
            isMatch = lineValue.includes(searchValue);

            if (debugLogging && isMatch) {
              console.log(`🔍 Text match found:`, {
                searchText,
                lineText: line.trim(),
                lineNumber
              });
            }
          }

          if (isMatch) {
            matches.push({
              lineNumber,
              lineText: line,
              isRegexPattern,
              pattern
            });
          }
        } catch (error) {
          // Invalid regex pattern, fallback to text search
          if (debugLogging) {
            console.log(`⚠️ Regex error, falling back to text search:`, error);
          }
          
          const searchValue = caseSensitive ? searchText : searchText.toLowerCase();
          const lineValue = caseSensitive ? line : line.toLowerCase();
          isMatch = lineValue.includes(searchValue);

          if (isMatch) {
            matches.push({
              lineNumber,
              lineText: line,
              isRegexPattern: false
            });
          }
        }
      });

      return matches;
    },
    [enableRegex, caseSensitive, debugLogging]
  );

  const isLineMatch = useCallback(
    (lineText: string, searchText: string): boolean => {
      if (!searchText.trim()) {
        return false;
      }

      try {
        if (enableRegex && searchText.startsWith('%')) {
          // Regex pattern search
          const pattern = searchText.slice(1);
          const regex = new RegExp(pattern, caseSensitive ? '' : 'i');
          return regex.test(lineText);
        } else {
          // Regular text search
          const searchValue = caseSensitive ? searchText : searchText.toLowerCase();
          const lineValue = caseSensitive ? lineText : lineText.toLowerCase();
          return lineValue.includes(searchValue);
        }
      } catch (error) {
        // Invalid regex pattern, fallback to text search
        const searchValue = caseSensitive ? searchText : searchText.toLowerCase();
        const lineValue = caseSensitive ? lineText : lineText.toLowerCase();
        return lineValue.includes(searchValue);
      }
    },
    [enableRegex, caseSensitive]
  );

  const getHighlightStyle = useCallback(
    (isMatch: boolean, colorMode: 'light' | 'dark' = 'light') => {
      if (!isMatch) {
        return {};
      }

      return {
        backgroundColor: colorMode === "dark" ? "#454745" : "lightgray",
      };
    },
    []
  );

  return {
    searchInText,
    isLineMatch,
    getHighlightStyle,
  };
}; 