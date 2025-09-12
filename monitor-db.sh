#!/bin/bash

echo "🔍 Real-Time MongoDB QuizMaster Database Monitor"
echo "================================================"
echo "Database: quizmaster"
echo "Collection: quizzes"
echo "Connection: mongodb://localhost:27017/quizmaster"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""

# Function to display quizzes in a nice format
show_quizzes() {
    echo "📊 Current Quizzes in Database:"
    echo "================================"
    mongosh quizmaster --quiet --eval "
    db.quizzes.find({}, {
        name: 1, 
        'questions.question': 1, 
        createdAt: 1,
        'questions.length': 1
    }).sort({createdAt: -1}).forEach(function(quiz) {
        print('📝 ' + quiz.name);
        print('   Questions: ' + quiz.questions.length);
        print('   Created: ' + quiz.createdAt);
        print('   Questions:');
        quiz.questions.forEach(function(q, i) {
            print('     ' + (i+1) + '. ' + q.question);
        });
        print('');
    });
    "
    echo "================================"
    echo "Total Quizzes: $(mongosh quizmaster --quiet --eval 'db.quizzes.countDocuments()')"
    echo ""
}

# Initial display
show_quizzes

# Monitor for changes every 3 seconds
while true; do
    sleep 3
    clear
    echo "🔍 Real-Time MongoDB QuizMaster Database Monitor"
    echo "================================================"
    echo "Database: quizmaster | Collection: quizzes"
    echo "Last updated: $(date)"
    echo ""
    show_quizzes
done
