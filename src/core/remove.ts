import {
  Range,
  type TextDocument,
  type TextEditor,
  WorkspaceEdit,
  window,
  workspace,
} from 'vscode'
import { getDebuggerStatementByLanguage } from '../utils'

async function removeInsertedLogger(this: TextEditor) {
  const { document } = this
  const statements = getAllStatementsByDocument(document)

  if (statements.length) {
    const editWorkspace = new WorkspaceEdit()
    statements.forEach((statement) => {
      editWorkspace.delete(document.uri, statement)
    })

    await workspace.applyEdit(editWorkspace)
    window.showInformationMessage('Remove inserted logger success.')
  } else {
    window.showInformationMessage('No logger statement found.')
  }
}

function getAllStatementsByDocument(document: TextDocument) {
  const content = document.getText()
  const regexp = new RegExp(
    `${getDebuggerStatementByLanguage(document)
      .replace(/\./g, '\\.')
      .replace(/\(.*?\)/, '\\(.*?\\)')}\\s*;?\\s*`,
    'gm',
  )

  const statements: Range[] = []

  let match: RegExpExecArray | null, range: Range

  do {
    match = regexp.exec(content)

    if (!match) {
      continue
    }

    range = new Range(
      document.positionAt(match.index),
      document.positionAt(match.index + match[0].length),
    )

    !range.isEmpty && statements.push(range)
  } while (match)

  return statements
}

export default removeInsertedLogger