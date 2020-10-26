input_file = 'Pb_31_Revised.json';
Plotly.d3.json(input_file, function (fig) {
    problem_list = fig.input_problem_list;
    var label = [];
    var n = [0];//the length of unique expression for each row id
    var source = [];
    var link_label = [];
    var target = [];
    var value = [];
    var lin_colour = [];

    var filtered = false;
    var sankey_type = 1;//0 Simple,  1 Productivity, 2 Pre-knowledge 
    var cluster_type = false;
    var cluster = 0;//0 All

    if (!cluster_type) {
        problem = problem_list;
    } else if (cluster == 0) {
        problem = _.sortBy(problem_list, 'cluster');
    } else {
        problem = _.filter(problem_list, function (ans) {
            return ans.cluster == "Cluster" + cluster
        });
    }

    _.sortBy(_.uniq(_.map(problem, function (elem) {
        return elem.row_id
    })), function (row) {
        return parseInt(row)
    }).forEach(function (val) {
        label.push(_.uniq(_.map(_.filter(problem_01, function (ans) {
            return ans.row_id == val
        }), function (valu) {
            return valu.expr_ascii
        })));
        n.push(label.flat().length);
    });//sort row id, for each row id get unique expression in label
    var problem_row = (_.find(problem, function (num) {
        return num.row_id == 0;
    }));
    //var prob_no = problem_row.problem_id;
    //var start_state = problem_row.start_state;
    //var end_state = problem_row.goal_state;
    var fh2t_user = _.uniq(_.map(problem, function (num) {
        return num.trial_id;
    }));//unique students
    fh2t_user.forEach(function (element) {
        var student_list = _.sortBy(_.filter(problem, function (num) {
            return num.trial_id == element;
        }), function (val) {
            return parseInt(val.row_id);
        });
        var expr_ascii_list = _.map(student_list, function (elem) {
            return elem.expr_ascii;
        });// for each student get expressions
        var productivity = _.map(student_list, function (elem) {
            return elem.productivity;
        });
        var cluster_list = _.map(student_list, function (elem) {
            return elem.cluster;
        });

        var prior_know = _.map(student_list, function (elem) {
            return elem["prior-knowledge"];
        });

        // For Filtered Sankey
        if (filtered) {
            if (expr_ascii_list.length > 11) {
                return;
            }
            var should_ret = true;
            for (i = 1; i < expr_ascii_list.length - 1 || i == 1; i++) {
                if (_.filter(problem_01, function (exp) {
                    return exp.row_id == i && exp.expr_ascii == expr_ascii_list[i]
                }).length > 1) {
                    should_ret = false;
                    break;
                }
            }
            if (should_ret) {
                return;
            }
        }

        for (i = 0; i < expr_ascii_list.length - 1; i++) {
            // for (i = 0; i < 10; i++) {
            var source_index = label[i].indexOf(expr_ascii_list[i]) + n[i];
            var target_index = label[i + 1].indexOf(expr_ascii_list[i + 1]) + n[i + 1];
            var source_list = source.reduce(function (a, e, i) {
                if (e === source_index)
                    a.push(i);
                return a;
            }, []);
            var target_list = target.reduce(function (a, e, i) {
                if (e === target_index)
                    a.push(i);
                return a;
            }, []);
            var link_label_list = link_label.reduce(function (a, e, ind) {
                if (e === cluster_list[i])
                    a.push(ind);
                return a;
            }, []);
            var indx = _.intersection(source_list, target_list, link_label_list);// to increase the count for same path
            if (indx.length > 0) {
                value[indx[0]] += 1;
            } else {
                source.push(source_index);
                target.push(target_index);
                link_label.push(cluster_list[i]);
                value.push(1);
                if (cluster_type && sankey_type == 0) {
                    if (cluster_list[i + 1] == "Cluster1") {
                        lin_colour.push("rgba(159, 37, 247,0.6)")

                    } else if (cluster_list[i + 1] == "Cluster2") {
                        lin_colour.push("rgba(11, 222, 0,0.4)")

                    } else if (cluster_list[i + 1] == "Cluster3") {
                        lin_colour.push("rgba(0, 0, 255,0.5)")

                    } else if (cluster_list[i + 1] == "Cluster4") {
                        lin_colour.push("rgba(247, 37, 37,0.5)")

                    }
                }
                if (sankey_type == 1) {
                    if (productivity[i + 1]) {
                        if (productivity[i + 1] == "1") {
                            lin_colour.push("rgba(0, 0, 255,0.5)")
                        } else {
                            lin_colour.push("rgba(255, 0, 0,0.5)")
                        }
                    } else {
                        lin_colour.push("rgba(68, 68, 68, 0.2)")
                    }
                }

                if (sankey_type == 2) {
                    if (prior_know[i + 1]) {
                        if (prior_know[i + 1] == "high") {
                            lin_colour.push("rgba(0, 255, 0,0.5)")
                        } else {
                            lin_colour.push("rgba(255, 0, 0,0.5)")
                        }
                    } else {
                        lin_colour.push("rgba(68, 68, 68, 0.2)")
                    }
                }

            }
        }
    });
    if (sankey_type == 0 && !cluster_type) {
        lin_colour = Array(source.length).fill("rgba(68, 68, 68, 0.2)")
    }
    var color = Array(label.flat().length).fill("black");
    var data = {
        type: "sankey",
        domain: {
            x: [0, 1],
            y: [0, 1]
        },
        orientation: "h",
        node: {
            pad: 10,
            thickness: 5,
            /*line: {
                color: "blue",
                width: 0.5
            },*/
            valueformat: ".0f",
            valuesuffix: "TWh",
            label: label.flat(),
            color: color
        },

        link: {
            source: source,
            target: target,
            value: value,
            color: lin_colour,
            label: link_label
        }
    }

    var data = [data]

    var layout = {
        title: "Problem XX",
        width: 6300,
        height: 900,
        font: {
            size: 15,
            color: "Black"
        }
    }

    Plotly.newPlot('myDiv', data, layout, { displaylogo: false })
});
