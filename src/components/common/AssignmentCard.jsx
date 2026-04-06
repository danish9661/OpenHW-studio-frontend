import { useState, useCallback } from 'react'
import { ChevronRight, ClipboardList, ChevronDown, ChevronUp, CheckCircle, Loader2 } from 'lucide-react'
import { formatDateTime } from './test.js'
import ClassroomAttachmentBlock from './ClassroomAttachmentBlock.jsx'
import { gradeSubmission, getMySubmissionGrade } from '../../services/classroomService.js'

// ─── Teacher: one row per student submission ───────────────────────────────────
function SubmissionGradeRow({ submission, classId, assignmentId }) {
  const [score, setScore] = useState(submission.score != null ? String(submission.score) : '')
  const [feedback, setFeedback] = useState(submission.feedback || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const student = submission.student || {}
  const avatarLetter = (student.name || student.username || 'S')[0].toUpperCase()

  const handleSave = async () => {
    const parsedScore = score === '' ? undefined : Number(score)
    if (parsedScore !== undefined && (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100)) {
      setError('Score must be 0 – 100')
      return
    }
    setError('')
    setSaving(true)
    try {
      await gradeSubmission(classId, assignmentId, submission._id, {
        ...(parsedScore !== undefined && { score: parsedScore }),
        ...(feedback.trim() && { feedback: feedback.trim() })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message || 'Failed to save grade')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grade-row">
      <div className="grade-row__student">
        <span className="grade-row__avatar">{avatarLetter}</span>
        <span className="grade-row__name">{student.name || student.username || 'Student'}</span>
      </div>

      {submission.notes && (
        <p className="grade-row__notes">{submission.notes}</p>
      )}

      {submission.attachments?.length > 0 && (
        <p className="grade-row__attachment-hint">
          {submission.attachments.length} attachment{submission.attachments.length > 1 ? 's' : ''} submitted
        </p>
      )}

      <div className="grade-row__fields">
        <label className="grade-row__label">
          Score (0–100)
          <input
            type="number"
            min="0"
            max="100"
            className="grade-row__score-input"
            value={score}
            onChange={(e) => { setScore(e.target.value); setSaved(false) }}
            placeholder="—"
          />
        </label>

        <label className="grade-row__label grade-row__label--feedback">
          Feedback
          <textarea
            className="grade-row__feedback-input"
            rows={2}
            value={feedback}
            onChange={(e) => { setFeedback(e.target.value); setSaved(false) }}
            placeholder="Optional feedback for student…"
          />
        </label>
      </div>

      {error && <p className="grade-row__error">{error}</p>}

      <button
        type="button"
        className={`grade-row__save-btn${saved ? ' grade-row__save-btn--saved' : ''}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <><Loader2 size={13} className="spin" /> Saving…</>
        ) : saved ? (
          <><CheckCircle size={13} /> Saved</>
        ) : (
          'Save Grade'
        )}
      </button>
    </div>
  )
}

// ─── Teacher: collapsible grading panel ───────────────────────────────────────
function TeacherGradingPanel({ classId, assignmentId, submissions = [] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="grading-panel">
      <button
        type="button"
        className="grading-panel__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>
          Submissions
          <span className="grading-panel__count">{submissions.length}</span>
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="grading-panel__body">
          {submissions.length === 0 ? (
            <p className="grading-panel__empty">No submissions yet.</p>
          ) : (
            submissions.map((sub) => (
              <SubmissionGradeRow
                key={sub._id}
                submission={sub}
                classId={classId}
                assignmentId={assignmentId}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Student: lazy-load own grade on expand ───────────────────────────────────
function StudentGradeView({ classId, assignmentId }) {
  const [open, setOpen] = useState(false)
  const [gradeData, setGradeData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleToggle = useCallback(async () => {
    const next = !open
    setOpen(next)
    if (next && gradeData === null && !loading) {
      setLoading(true)
      try {
        const data = await getMySubmissionGrade(classId, assignmentId)
        setGradeData(data)
      } catch (err) {
        setError(err.message || 'Failed to load grade')
      } finally {
        setLoading(false)
      }
    }
  }, [open, gradeData, loading, classId, assignmentId])

  const submission = gradeData?.submission

  return (
    <div className="student-grade-view">
      <button
        type="button"
        className="student-grade-view__toggle"
        onClick={handleToggle}
        aria-expanded={open}
      >
        <span>My Grade</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="student-grade-view__body">
          {loading && (
            <p className="student-grade-view__loading">
              <Loader2 size={13} className="spin" /> Loading…
            </p>
          )}
          {error && <p className="student-grade-view__error">{error}</p>}
          {!loading && !error && submission == null && (
            <p className="student-grade-view__empty">You haven't submitted yet.</p>
          )}
          {!loading && !error && submission != null && (
            <>
              {submission.score != null ? (
                <p className="student-grade-view__score">
                  Score: <strong>{submission.score} / 100</strong>
                </p>
              ) : (
                <p className="student-grade-view__pending">Not graded yet.</p>
              )}
              {submission.feedback && (
                <p className="student-grade-view__feedback">
                  <span className="student-grade-view__feedback-label">Feedback: </span>
                  {submission.feedback}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main AssignmentCard (all original props untouched) ───────────────────────
export default function AssignmentCard({
  // original props — unchanged
  teacherName,
  title,
  dueDate,
  createdAt,
  attachments = [],
  onPreviewFile,
  onClick,
  // new optional props for grading
  role,          // 'teacher' | 'student'  — if omitted, grading UI is hidden
  classId,
  assignmentId,
  submissions    // teacher only: array from getAssignmentSubmissions()
}) {
  const timeLabel = dueDate ? `Due ${formatDateTime(dueDate)}` : `Posted ${formatDateTime(createdAt)}`

  return (
    <div>
      {/* ── original card button — untouched ── */}
      <button
        type="button"
        className="teacher-assignment-post"
        onClick={onClick}
        aria-label="Open assignment"
      >
        <span className="teacher-assignment-post__icon" aria-hidden="true">
          <ClipboardList size={16} />
        </span>
        <span className="teacher-assignment-post__copy">
          <span className="teacher-assignment-post__line">
            <span className="teacher-assignment-post__byline">
              {teacherName || 'Teacher'} posted:
            </span>
            <span className="teacher-assignment-post__title">{title}</span>
          </span>
          <span className="teacher-assignment-post__time">{timeLabel}</span>
        </span>
        <span className="teacher-assignment-post__chevron" aria-hidden="true">
          <ChevronRight size={18} />
        </span>
      </button>

      {/* ── original attachments — untouched ── */}
      <ClassroomAttachmentBlock
        source={{ attachments }}
        wrapperClassName="classroom-files--assignment"
        onPreviewFile={onPreviewFile}
      />

      {/* ── grading UI — only renders when role + IDs are passed ── */}
      {role === 'teacher' && classId && assignmentId && (
        <TeacherGradingPanel
          classId={classId}
          assignmentId={assignmentId}
          submissions={submissions || []}
        />
      )}

      {role === 'student' && classId && assignmentId && (
        <StudentGradeView
          classId={classId}
          assignmentId={assignmentId}
        />
      )}
    </div>
  )
}
