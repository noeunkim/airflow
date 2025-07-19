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

        if (enableRegex && searchText.startsWith('%')) {
          pattern = searchText.slice(1);
          const regexPattern = pattern
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace(/%/g, '.*')
            .replace(/_/g, '.');
          
          const regex = new RegExp(regexPattern, caseSensitive ? '' : 'i');
          isMatch = regex.test(line);
          isRegexPattern = true;
        } else {
          const searchValue = caseSensitive ? searchText : searchText.toLowerCase();
          const lineValue = caseSensitive ? line : line.toLowerCase();
          
          const pattern = `%${searchValue}%`;
          const regexPattern = pattern
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace(/%/g, '.*');
          
          const regex = new RegExp(regexPattern, caseSensitive ? '' : 'i');
          isMatch = regex.test(lineValue);
        }

        if (isMatch) {
          matches.push({
            lineNumber,
            lineText: line,
            isRegexPattern,
            pattern
          });
        }
      });

      return matches;
    },
    [enableRegex, caseSensitive, debugLogging]
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
    getHighlightStyle,
  };
}; 