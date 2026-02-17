import { getFacultyBySlug, getSortedFaculty } from '../../models/faculty/faculty.js';

const facultyListPage = async (req, res) => {

    const sortBy = req.query.sort || "department";
    const facultyList = await getSortedFaculty(sortBy);
    
    res.render('faculty/list', {
        title: 'Faculty',
        facultyList: facultyList,
        currentSort: sortBy
    });
}

const facultyDetailPage = async (req, res, next) => {
    const facultySlug = req.params.slugId;
    const faculty = await getFacultyBySlug(facultySlug);
    console.log(faculty)
    if (!faculty || Object.keys(faculty).length === 0) {
        const err = new Error(`Faculty ${facultySlug} not found`); 
        err.status = 404;
        return next(err);
    }
    
    res.render('faculty/detail', { 
        title: `${facultySlug} - ${faculty.name}`,
        faculty: faculty
    });
}

export { facultyDetailPage, facultyListPage };
