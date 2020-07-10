import express from "express";
import { promises } from "fs";

const router = express.Router();
const readFile = promises.readFile;
const writeFile = promises.writeFile;
const gradesJsonFile = './grades.json';


async function readFileJson() {
    try {
        const data = await readFile(gradesJsonFile, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        logger.error(`GET /grades/getNotes | Error: ${err.message}`);
        return err;
    }
}


router.get('/getNotes', async (req, res) => {
    const student = req.body.student;
    const subject = req.body.subject;
    let totalNotes = 0;
    try {
        const json = await readFileJson();
        const grades = json.grades.filter(x => x.student === student && x.subject === subject);

        grades.forEach((grade) => {
            totalNotes += grade.value;
        });
        
        res.send({
            ok: true,
            message: `Student: ${student} | Subject: ${subject} | Total Grades: ${totalNotes}`
        });
        logger.info(`GET /grades sucess`);
    } catch (err) {
        
        res.status(400).send(err);
    }
});

router.get('/getAverage', async (req, res) => {
    const type = req.body.type;
    const subject = req.body.subject;
    let averageGrades = 0;
    let totalNotes = 0;
    try {
        const json = await readFileJson();
        const grades = json.grades.filter(x => x.type === type && x.subject === subject);

        grades.forEach((grade) => {
            totalNotes += grade.value;
        });

        averageGrades = totalNotes / grades.length;

        res.send({
            ok: true,
            message: `Subject: ${subject} | Average: ${averageGrades}`
        });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/getBestGrades', async (req, res) => {
    const type = req.body.type;
    const subject = req.body.subject;

    try {
        const json = await readFileJson();
        const grades = json.grades.filter(x => x.type === type && x.subject === subject);

        const bestGradesSort = grades.sort((a, b) => {
            return b.value - a.value
        }, 3);

        res.send({
            ok: true,
            data: bestGradesSort
        });

    } catch (err) {
        res.status(400).send(err);
    }
});


router.get('/:id', async (req, res) => {
    const gradeId = parseInt(req.params.id);
    try {
        const json = await readFileJson();
        const grade = json.grades.find(grade => grade.id === gradeId);
        grade === undefined ? res.status(400).send('Id inválido') : res.send(grade);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/newGrade', async (req, res) => {
    let newGradeBody = req.body;

    try {
        const json = await readFileJson();
        const dateNow = new Date();
        const newGrade = { id: json.nextId++, ...newGradeBody, timestamp: dateNow };
        json.nextId = json.nextId++;
        json.grades.push(newGrade);

        writeFile(gradesJsonFile, JSON.stringify(json));

        res.end();
    } catch (err) {
        res.status(400).send(err);
    }
});

router.put('/editGrade/:id', async (req, res) => {
    const editGradeParams = parseInt(req.params.id);
    const editGradeBody = req.body;

    try {
        const json = await readFileJson();
        const indexGrade = json.grades.findIndex(grade => grade.id === editGradeParams);
        const timestamp = new Date();

        if (indexGrade < 0) {
            res.status(400).send('Id inválido');
        }

        const grade = { id: editGradeParams, ...editGradeBody, timestamp: timestamp };
        json.grades[indexGrade] = grade;

        writeFile(gradesJsonFile, JSON.stringify(json));

        res.end();

    } catch (err) {
        res.status(400).send(err);
    }
});


router.delete('/deleteGrade/:id', async (req, res) => {
    const deleteGradeParams = parseInt(req.params.id);
    try {
        const json = await readFileJson();
        const grades = json.grades.filter(grade => grade.id !== deleteGradeParams);
        json.grades = grades;
        writeFile(gradesJsonFile, JSON.stringify(json));
        res.end();
    } catch (err) {
        res.status(400).send(err);
    };
})


export default router;